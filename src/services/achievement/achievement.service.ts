import { IPagedResult, IRequest } from "@/interfaces";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { OrderBy } from "@/enums/mongo-query.enum";
import { IAchievement } from "@/interfaces/achievement.interface";
import { AchievementRepo } from "@/repository/achievement.repo";

class AchievementService {
  private repo = new AchievementRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/achievements") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<IAchievement>>(
      pipeline
    );

    res.render("admin/achievements/index", {
      title: "Boshqaruv paneli - Yutuqlar",
      activeUrl: "/admin/achievements",
      pageTitle: "Yutuqlar",
      admin,
      achievements: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    res.render("admin/achievements/add", {
      title: "Boshqaruv paneli - Yangi yutuq qo'shish",
      pageTitle: "Yutuq qo'shish",
      activeUrl: "/admin/achievements",
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const { fullName, description } = req.body;
    const fileName = req.file.filename;

    await this.repo.create({
      fullName,
      description,
      image: `/uploads/achievements/${fileName}`,
    });

    res.redirect("/admin/achievements");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const achievement = await this.repo.getById(id);

    res.render("admin/achievements/edit", {
      title: "Boshqaruv paneli - Yutuqni tahrirlash",
      pageTitle: "Yutuqni tahrirlash",
      activeUrl: "/admin/achievements",
      admin,
      updateErr: req.flash("updateErr")[0],
      achievement,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<IAchievement> = {};
    const { fullName, description } = req.body;

    const achievement = await this.repo.getById(id);

    if (fullName) data.fullName = fullName;
    if (description) data.description = description;

    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../../public${achievement.image}`
      );

      fs.unlinkSync(oldImagePath);

      data.image = `/uploads/achievements/${req.file.filename}`;
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/achievements");
  };

  public delete = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const achievement = await this.repo.getById(id);
    const oldImagePath = path.join(
      __dirname,
      `../../../public${achievement.image}`
    );
    fs.unlinkSync(oldImagePath);

    await this.repo.deleteById(id);

    res.redirect("/admin/achievements");
  };
}

export default AchievementService;
