import { IPagedResult, IRequest } from "@/interfaces";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import { ApplicationRepo } from "@/repository/application.repo";
import { IApplication } from "@/interfaces/application.interface";
import { OrderBy } from "@/enums/mongo-query.enum";

class ApplicationService {
  private repo = new ApplicationRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/applications") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .paginating()
      .sorting("createdAt", OrderBy.Desc)
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<IApplication>>(
      pipeline
    );

    res.render("admin/applications/index", {
      title: "Boshqaruv paneli - Murojaatlar",
      activeUrl: "/admin/applications",
      pageTitle: "Murojaatlar",
      admin,
      applications: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };
}

export default ApplicationService;
