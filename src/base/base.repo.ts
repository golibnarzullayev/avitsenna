import _ from "lodash";
import {
  AnyBulkWriteOperation,
  FilterQuery,
  Model,
  PipelineStage,
  QueryOptions as MongooseQueryOptions,
  UpdateQuery as MongooseUpdateQuery,
  UpdateWithAggregationPipeline,
} from "mongoose";

import { OrderBy } from "@/enums/mongo-query.enum";
import { IFilter, IPagedResult } from "@/interfaces";

type UpdateQuery<T, U = T> =
  | MongooseUpdateQuery<T>
  | UpdateWithAggregationPipeline
  | Partial<U>;
type QueryOptions<T, K extends keyof T = keyof T> = MongooseQueryOptions<T> & {
  returnDocs?: boolean;
  pick?: K[];
  omit?: K[];
  relatedUpdates?: Array<{
    model: Model<any>;
    properties: K[];
    filter: FilterQuery<T>;
    update: UpdateQuery<T>;
  }>;
};

export abstract class BaseRepo<
  T,
  TCreateDto extends UpdateQuery<any> = UpdateQuery<any>,
  TUpdateDto = TCreateDto
> {
  protected abstract model: Model<T>;

  public async create(data: TCreateDto): Promise<T> {
    return this.model.create(data);
  }

  public async getMany(filter: IFilter<T>): Promise<T[]>;
  public async getMany<K extends keyof T>(
    filter: IFilter<T>,
    options: { pick?: K[]; sortBy: keyof T; orderBy: OrderBy; limit?: number }
  ): Promise<T[]>;
  public async getMany<K extends keyof T>(
    filter: IFilter<T>,
    options: { pick: K[]; limit?: number }
  ): Promise<Pick<T, K>[]>;
  public async getMany<K extends keyof T>(
    filter: IFilter<T>,
    options: { omit: K[]; limit?: number }
  ): Promise<Omit<T, K>[]>;
  public async getMany<K extends keyof T>(
    filter: IFilter<T>,
    options: { limit: number }
  ): Promise<Omit<T, K>[]>;
  public async getMany<K extends keyof T>(
    filter: IFilter<T>,
    options?: {
      pick?: K[];
      omit?: K[];
      sortBy?: keyof T;
      orderBy?: OrderBy;
      limit?: number;
    }
  ): Promise<(T | Pick<T, K> | Omit<T, K>)[]> {
    const select = this.buildSelectQuery<K>(options);

    const { sortBy, orderBy } = options ?? {};
    const acc = orderBy === OrderBy.Asc ? 1 : -1;

    return this.model
      .find<T>(filter)
      .select(select)
      .sort({ [sortBy as string]: acc })
      .lean<T[]>()
      .limit(options?.limit)
      .exec();
  }

  public async countDocuments(filter: IFilter<T>): Promise<number> {
    return this.model.countDocuments(filter);
  }

  public async getWithPagination(
    pipeline: PipelineStage[]
  ): Promise<IPagedResult<T>> {
    const [result] = await this.model
      .aggregate<IPagedResult<T>>(pipeline)
      .exec();
    return result;
  }

  public async getOne(filter: IFilter<T>): Promise<T>;
  public async getOne<K extends keyof T>(
    filter: IFilter<T>,
    options: { pick: K[] }
  ): Promise<Pick<T, K>>;
  public async getOne<K extends keyof T>(
    filter: IFilter<T>,
    options: { omit: K[] }
  ): Promise<Omit<T, K>>;
  public async getOne<K extends keyof T>(
    filter: IFilter<T>,
    options?: { pick?: K[]; omit?: K[] }
  ): Promise<Pick<T, K> | Omit<T, K> | T> {
    const select = this.buildSelectQuery<K>(options);

    return this.model.findOne<T>(filter).select(select).lean<T>().exec();
  }

  public async getById(id: string): Promise<T>;
  public async getById<K extends keyof T>(
    id: string,
    options: { pick: K[] }
  ): Promise<Pick<T, K>>;
  public async getById<K extends keyof T>(
    id: string,
    options: { omit: K[] }
  ): Promise<Omit<T, K>>;
  public async getById<K extends keyof T>(
    id: string,
    options?: { pick?: K[]; omit?: K[] }
  ): Promise<Pick<T, K> | Omit<T, K> | T> {
    const select = this.buildSelectQuery<K>(options);

    return this.model.findById<T>(id).select(select).lean<T>().exec();
  }

  public async getByIds(ids: string[]): Promise<T[]>;
  public async getByIds<K extends keyof T>(
    ids: string[],
    options: { pick: K[] }
  ): Promise<Array<Pick<T, K>>>;
  public async getByIds<K extends keyof T>(
    ids: string[],
    options: { omit: K[] }
  ): Promise<Array<Omit<T, K>>>;
  public async getByIds<K extends keyof T>(
    ids: string[],
    options?: { pick?: K[]; omit?: K[] }
  ): Promise<Array<Pick<T, K> | Omit<T, K> | T>> {
    const select = this.buildSelectQuery<K>(options);

    return this.model
      .find<T>({ _id: { $in: ids } })
      .select(select)
      .lean<T[]>()
      .exec();
  }

  public async existsById(id: string): Promise<boolean> {
    const result = await this.model.exists({ _id: id }).exec();

    return Boolean(result);
  }

  public async existsOne(filter: IFilter<T>): Promise<boolean> {
    const result = await this.model.exists(filter).exec();

    return Boolean(result);
  }

  public async aggregate<T>(pipeline: PipelineStage[]): Promise<T> {
    const [result] = await this.model.aggregate(pipeline).exec();
    return result;
  }

  public async updateById(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options?: QueryOptions<T> & { returnDocs: false }
  ): Promise<void>;
  public async updateById(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options: QueryOptions<T> & { returnDocs: true }
  ): Promise<T>;
  public async updateById<K extends keyof T>(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options: QueryOptions<T> & { pick: K[] }
  ): Promise<Pick<T, K>>;
  public async updateById<K extends keyof T>(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options: QueryOptions<T> & { omit: K[] }
  ): Promise<Omit<T, K>>;
  public async updateById(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options: QueryOptions<T>
  ): Promise<void>;
  public async updateById<K extends keyof T>(
    id: string,
    update: UpdateQuery<T, TUpdateDto>,
    options?: QueryOptions<T, K>
  ): Promise<void | T | Pick<T, K> | Omit<T, K>> {
    let result: T | undefined;

    if (options?.returnDocs || options?.pick || options?.omit) {
      const select = this.buildSelectQuery<K>(options);

      result = await this.model
        .findByIdAndUpdate<TUpdateDto>(
          id,
          update as unknown as UpdateQuery<T>,
          { ...options, new: true }
        )
        .select(select)
        .lean<T>()
        .exec();
    } else {
      await this.model
        .updateOne<T>(
          { _id: id },
          update as unknown as UpdateQuery<T>,
          options as any
        )
        .lean<T>()
        .exec();
    }

    if (options?.relatedUpdates && options.relatedUpdates.length) {
      for (const relatedUpdate of options.relatedUpdates) {
        if (this.hasInUpdate(relatedUpdate.properties, update)) {
          await relatedUpdate.model
            .updateMany(relatedUpdate.filter, relatedUpdate.update)
            .exec();
        }
      }
    }

    return result;
  }

  public async updateOne(
    filter: IFilter<T>,
    update: Partial<TUpdateDto>
  ): Promise<void>;
  public async updateOne(
    filter: IFilter<T>,
    update: Partial<TUpdateDto>,
    options: { returnDocs: true }
  ): Promise<T>;
  public async updateOne(
    filter: IFilter<T>,
    update: Partial<TUpdateDto>,
    options: { returnDocs: false }
  ): Promise<void>;
  public async updateOne(
    filter: IFilter<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options: QueryOptions<T> & { returnDocs: true }
  ): Promise<T>;
  public async updateOne(
    filter: IFilter<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options: QueryOptions<T>
  ): Promise<void>;
  public async updateOne(
    filter: IFilter<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline
  ): Promise<void>;
  public async updateOne<K extends keyof T>(
    filter: IFilter<T>,
    update: UpdateQuery<T> | UpdateWithAggregationPipeline,
    options?: { returnDocs?: boolean; pick?: K[]; omit?: K[] }
  ): Promise<void | T>;
  public async updateOne<K extends keyof T>(
    filter: IFilter<T>,
    update:
      | Partial<TUpdateDto>
      | UpdateQuery<T>
      | UpdateWithAggregationPipeline,
    options?: QueryOptions<T> & { returnDocs?: boolean; pick?: K[]; omit?: K[] }
  ): Promise<void | T> {
    const select = this.buildSelectQuery<K>(options);

    if (options?.returnDocs)
      return this.model
        .findOneAndUpdate<T>(filter, update as unknown as UpdateQuery<T>, {
          ...options,
          new: true,
        })
        .select(select)
        .lean<T>()
        .exec();

    await this.model
      .updateOne<T>(filter, update as unknown as UpdateQuery<T>, options as any)
      .lean<T>()
      .exec();
  }

  public async deleteById(id: string): Promise<T> {
    return this.model.findByIdAndDelete(id).exec();
  }

  public async deleteOne(filter: IFilter<T>): Promise<T> {
    return this.model.findOneAndDelete(filter).exec();
  }

  public async bulkWrite(operations: AnyBulkWriteOperation[]): Promise<void> {
    await this.model.bulkWrite(operations);
  }

  protected buildSelectQuery<K extends keyof T>(options?: {
    pick?: K[];
    omit?: K[];
  }): string | undefined {
    const { pick, omit } = options ?? {};

    if (pick) return pick.join(" ");
    else if (omit) return omit.map((o) => `-${String(o)}`).join(" ");
  }

  protected hasInUpdate(
    properties: (keyof T | string)[],
    update: UpdateQuery<T, TUpdateDto>
  ): boolean {
    let result = false;

    for (const property of properties) {
      if (result) break;

      const search = (obj: UpdateQuery<T, TUpdateDto>) => {
        if (result) return;

        if (_.has(obj, property)) {
          result = true;

          return;
        }

        _.forOwn(obj, (value) => {
          if (_.isObject(value)) {
            if (_.isArray(value)) {
              for (const item of value) {
                search(item);
              }
            } else search(value);
          }
        });
      };

      search(update);
    }

    return result;
  }
}
