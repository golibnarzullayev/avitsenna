import { IPagedResult, IRequest } from "@/interfaces";
import { IDirection } from "@/interfaces/direction.interface";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { DirectionRepo } from "@/repository/direction.repo";
import { OrderBy } from "@/enums/mongo-query.enum";

class DirectionService {
  private repo = new DirectionRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/directions") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .searching("fullName, teacher.fullName")
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<IDirection>>(
      pipeline
    );

    res.render("admin/directions/index", {
      title: "Boshqaruv paneli - Yo'nalishlar",
      activeUrl: "/admin/directions",
      pageTitle: "Yo'nalishlar",
      admin,
      directions: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    res.render("admin/directions/add", {
      title: "Boshqaruv paneli - Yo'nalish qo'shish",
      pageTitle: "Yo'nalish qo'shish",
      activeUrl: "/admin/directions",
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const { title } = req.body;
    const fileName = req.file.filename;

    await this.repo.create({ title, image: `/uploads/directions/${fileName}` });

    res.redirect("/admin/directions");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const direction = await this.repo.getById(id);

    res.render("admin/directions/edit", {
      title: "Boshqaruv paneli - Yo'nalishni tahrirlash",
      pageTitle: "Yo'nalishni tahrirlash",
      activeUrl: "/admin/directions",
      admin,
      updateErr: req.flash("updateErr")[0],
      direction,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<IDirection> = {};
    const { title } = req.body;

    const leadership = await this.repo.getById(id);

    if (title) data.title = title;

    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../../public${leadership.image}`
      );

      fs.unlinkSync(oldImagePath);

      data.image = `/uploads/directions/${req.file.filename}`;
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/directions");
  };

  public delete = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const leadership = await this.repo.getById(id);
    const oldImagePath = path.join(
      __dirname,
      `../../../public${leadership.image}`
    );
    fs.unlinkSync(oldImagePath);

    await this.repo.deleteById(id);

    res.redirect("/admin/directions");
  };

  public updateStatus = async (req: IRequest, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;

    await this.repo.updateById(id, { status });

    res.redirect("/admin/directions");
  };
}

export default DirectionService;
