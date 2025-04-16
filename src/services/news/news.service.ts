import { IPagedResult, IRequest } from "@/interfaces";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { NewsRepo } from "@/repository/news.repo";
import { INews } from "@/interfaces/news.interface";
import { generateUniqueIdUtil, slugifyUtil } from "@/utils";
import { NewsStatus } from "@/enums/news-status.enum";
import { OrderBy } from "@/enums/mongo-query.enum";

class NewsService {
  private repo = new NewsRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/news") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .searching("title,description,shortDescription")
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<INews>>(pipeline);

    res.render("admin/news/index", {
      title: "Boshqaruv paneli - Yangiliklar",
      activeUrl: "/admin/news",
      pageTitle: "Rahbariyat",
      admin,
      news: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    res.render("admin/news/add", {
      title: "Boshqaruv paneli - Yangilik qo'shish",
      pageTitle: "Yangilik qo'shish",
      activeUrl: "/admin/news",
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const fileName = req.file.filename;
    const slug = slugifyUtil(req.body.title);
    const postId = generateUniqueIdUtil();

    await this.repo.create({
      ...req.body,
      slug,
      postId,
      image: `/uploads/news/${fileName}`,
      status: NewsStatus.Active,
    });

    res.redirect("/admin/news");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const news = await this.repo.getById(id);

    res.render("admin/news/edit", {
      title: "Boshqaruv paneli - Yangilikni tahrirlash",
      pageTitle: "Yangilikni tahrirlash",
      activeUrl: "/admin/news",
      admin,
      updateErr: req.flash("updateErr")[0],
      news,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<INews> = {};
    const { title, shortDescription, description } = req.body;

    const news = await this.repo.getById(id);

    if (title) {
      data.title = title;
      data.slug = slugifyUtil(title);
    }
    if (description) data.description = description;
    if (shortDescription) data.shortDescription = shortDescription;

    if (req.file) {
      const oldImagePath = path.join(__dirname, `../../../public${news.image}`);

      fs.unlinkSync(oldImagePath);

      data.image = `/uploads/news/${req.file.filename}`;
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/news");
  };

  public delete = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const news = await this.repo.getById(id);
    const oldImagePath = path.join(__dirname, `../../../public${news.image}`);
    fs.unlinkSync(oldImagePath);

    await this.repo.deleteById(id);

    res.redirect("/admin/news");
  };
}

export default NewsService;
