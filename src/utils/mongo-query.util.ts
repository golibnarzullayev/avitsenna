import dayjs from "dayjs";
import _ from "lodash";
import { isValidObjectId, PipelineStage } from "mongoose";

import { ObjectId } from "@/utils/objectid-util";
import { OrderBy, QueryLimit } from "@/enums/mongo-query.enum";

import { QueryDto } from "@/dtos/query.dto";

class MongoQueryService<T extends QueryDto> {
  private readonly query: T;
  private readonly result: {
    page: number;
    limit: number;
    skip?: number;
    sort?: object;
    select?: object;
    neverSelect?: object;
    filter?: any;
  };

  constructor(query?: T) {
    this.query = query;
    this.result = {
      page: 1,
      limit: null,
      filter: {},
    };
  }

  private convertValueToCorrFormat(key: string, value: string) {
    if (value === "true" || value === "false") return JSON.parse(value);
    if (value === "null") return null;
    if (!isNaN(Number(value))) return Number(value);
    if (isValidObjectId(value)) return ObjectId(value);
    if (key.includes("_id") || (key !== "search" && isValidObjectId(value)))
      return ObjectId(value);
    return value;
  }

  public paginating(): MongoQueryService<T> {
    this.result.page = Number(this.query?.page) || 1;
    this.result.limit =
      this.query?.limit === QueryLimit.All
        ? 0
        : Number(this.query?.limit) || 10;
    this.result.skip = (this.result.page - 1) * this.result.limit;
    return this;
  }

  public sorting(
    sortBy = "createdAt",
    orderBy?: OrderBy
  ): MongoQueryService<T> {
    const field = this.query?.sort_by || sortBy;
    const asc =
      (this.query?.order_by?.toLowerCase() || orderBy) === OrderBy.Asc;
    this.result.sort = { [field]: asc ? 1 : -1 };
    return this;
  }

  public searching(searchFields: string): MongoQueryService<T> {
    if (this.query?.search) {
      const search = this.query.search.replace(
        /[^a-zA-Zа-яА-Я0-9\s.,'"`‘’!@#&\-+()\\/]/g,
        ""
      );

      this.result.filter.$or = searchFields.split(",").map((field) => ({
        $expr: {
          $regexMatch: {
            input: {
              $cond: {
                if: { $isArray: `$${field}` },
                then: {
                  $reduce: {
                    input: `$${field}`,
                    initialValue: "",
                    in: { $concat: ["$$value", " ", "$$this"] },
                  },
                },
                else: { $toString: `$${field}` },
              },
            },
            regex: search,
            options: "i",
          },
        },
      }));
    }
    return this;
  }

  public filtering(
    defaultFilter: object = {},
    forceFilter: object = {}
  ): MongoQueryService<T> {
    const query = { ...this.query };
    const resultQuery = { ...defaultFilter };
    const excludedFields = [
      "page",
      "sort_by",
      "order_by",
      "limit",
      "search",
      "select",
    ];

    excludedFields.forEach((field) => delete query[field]);
    Object.entries(query).forEach(([key, value]) => {
      let formattedValue: any;

      if (Array.isArray(value)) {
        formattedValue = value.map((val) =>
          this.convertValueToCorrFormat(key, val)
        );
      } else if (typeof value === "string" && value.split(",").length > 1) {
        formattedValue = value
          .split(",")
          .map((val) => this.convertValueToCorrFormat(key, val));
      } else {
        formattedValue = this.convertValueToCorrFormat(key, value);
      }

      const { field, filterType } = this.generateFieldAndFilterType(key);

      const isTimestampFilter = /createdAt|updatedAt|date/.test(key);

      if (field && filterType) {
        if (filterType === ".nin") {
          resultQuery[field] = { $nin: formattedValue.split(",") };
        } else if (filterType === ".in") {
          resultQuery[field] = { $in: [formattedValue] };
        } else if (filterType === ".ne") {
          resultQuery[field] = { $ne: formattedValue };
        } else if (filterType === ".gte" || filterType === ".lte") {
          resultQuery[field] = {
            ...resultQuery[field],
            [filterType === ".gte" ? "$gte" : "$lte"]: isTimestampFilter
              ? dayjs(value).toDate()
              : Number(value),
          };
        } else if (filterType === ".and" || filterType === ".or") {
          resultQuery[`$${filterType.slice(1)}`] = Array.isArray(value)
            ? value
            : [value];
        } else if (filterType === ".exists") {
          resultQuery[field] = { $exists: value === "true" ? true : false };
        }
      } else {
        resultQuery[key] = Array.isArray(formattedValue)
          ? { $in: formattedValue }
          : formattedValue;
      }
    });

    this.result.filter = {
      ...this.result.filter,
      ...resultQuery,
      ...forceFilter,
    };
    return this;
  }

  public selecting(
    defaultSelect = "",
    neverSelect = "",
    onlySelect = ""
  ): MongoQueryService<T> {
    const select = this.query?.select || defaultSelect;
    const result = {};

    if (select && !onlySelect) {
      select
        .split(",")
        .filter(Boolean)
        .forEach((field) => {
          const isNonSelect = field.startsWith("-");
          result[isNonSelect ? field.slice(1) : field] = isNonSelect ? 0 : 1;
        });
    }

    if (neverSelect) {
      neverSelect.split(",").forEach((field) => {
        result[field.trim()] = 0;
      });
      this.result.neverSelect = result;
    }

    if (onlySelect) {
      onlySelect.split(",").forEach((field) => {
        result[field.trim()] = 1;
      });
    }

    this.result.select = Object.keys(result).length ? result : null;
    return this;
  }

  public getQueries(): { select: string | any } {
    const { select, neverSelect } = this.result;
    if (!_.isEmpty(select) && !_.isEmpty(neverSelect)) {
      Object.keys(neverSelect).forEach((key) => {
        delete select[key];
      });
    }
    return { select: _.isEmpty(select) ? neverSelect : select };
  }

  public getPipeline = (withoutPaged?: boolean): PipelineStage[] => {
    const pipeline: PipelineStage.FacetPipelineStage[] = [];

    if (this.result.filter && Object.keys(this.result.filter).length) {
      pipeline.push({ $match: this.result.filter });
    }
    if (this.result.sort && Object.keys(this.result.sort).length) {
      pipeline.push({ $sort: { ...this.result.sort } });
    }
    if (this.result.select && Object.keys(this.result.select).length) {
      pipeline.push({ $project: { ...this.result.select } });
    }
    if (
      this.result.neverSelect &&
      Object.keys(this.result.neverSelect).length
    ) {
      pipeline.push({ $project: { ...this.result.neverSelect } });
    }

    pipeline.push({ $skip: this.result.skip || 0 });
    if (this.result.limit) pipeline.push({ $limit: this.result.limit });

    if (withoutPaged) return pipeline;

    const resultCount = { $ifNull: [{ $first: "$resultCount.count" }, 0] };
    const limit = {
      $cond: [this.result.limit === 0, resultCount, this.result.limit],
    };

    return [
      {
        $facet: {
          data: pipeline,
          resultCount: [{ $match: this.result.filter }, { $count: "count" }],
          totalCount: [{ $count: "count" }],
        },
      },
      {
        $addFields: {
          totalCount: { $ifNull: [{ $first: "$totalCount.count" }, 0] },
          resultCount: resultCount,
          currentPage: this.result.page,
          limit: limit,
          pagesCount: {
            $cond: {
              if: { $ne: [limit, 0] },
              then: { $ceil: { $divide: [resultCount, limit] } },
              else: 0,
            },
          },
        },
      },
    ];
  };

  private generateFieldAndFilterType = (
    key: string
  ): { field?: string; filterType?: string } => {
    const sliceLengthMap: Record<string, number> = {
      ".gte": 4,
      ".lte": 4,
      ".nin": 3,
      ".in": 3,
      ".ne": 3,
      ".and": 4,
      ".or": 3,
      ".exists": 7,
    };

    let field: string;
    let filterType: string;

    Object.entries(sliceLengthMap).forEach(([suffix, length]) => {
      if (key.endsWith(suffix)) {
        field = key.slice(0, -length);
        filterType = suffix;
      }
    });

    return {
      field: field,
      filterType: filterType,
    };
  };
}

export default MongoQueryService;
