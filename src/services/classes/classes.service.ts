import { IPagedResult, IRequest } from "@/interfaces";
import { IClasses } from "@/interfaces/classes.interface";
import { ClassesRepo } from "@/repository/classes.model";
import { LeadershipRepo } from "@/repository/leadership.repo";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { OrderBy } from "@/enums/mongo-query.enum";

class ClasessService {
  private repo = new ClassesRepo();
  private leadershipRepo = new LeadershipRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/classes") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .searching("fullName, teacher.fullName")
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<IClasses>>(pipeline);

    res.render("admin/classes/index", {
      title: "Boshqaruv paneli - Sinflar",
      activeUrl: "/admin/classes",
      pageTitle: "Sinflar",
      admin,
      classes: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    const teachers = await this.leadershipRepo.getMany({ isLeader: false });

    res.render("admin/classes/add", {
      title: "Boshqaruv paneli - Rahbariyatga a'zo qo'shish",
      pageTitle: "Sinf qo'shish",
      activeUrl: "/admin/classes",
      teachers,
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const { title, teacherId } = req.body;
    const fileName = req.file.filename;

    const teacher = await this.leadershipRepo.getById(teacherId);

    await this.repo.create({
      title,
      teacher: { _id: teacherId, fullName: teacher.fullName },
      image: `/uploads/classes/${fileName}`,
    });

    res.redirect("/admin/classes");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const classes = await this.repo.getById(id);
    const teachers = await this.leadershipRepo.getMany({ isLeader: false });

    res.render("admin/classes/edit", {
      title: "Boshqaruv paneli - Sinf'ni tahrilash",
      pageTitle: "Sinfni tahrirlash",
      activeUrl: "/admin/classes",
      admin,
      updateErr: req.flash("updateErr")[0],
      classes: {
        ...classes,
        teacher: { ...classes.teacher, _id: classes.teacher._id.toString() },
      },
      teachers,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<IClasses> = {};
    const { title, teacherId } = req.body;

    const leadership = await this.repo.getById(id);

    if (title) data.title = title;
    if (teacherId) {
      const teacher = await this.leadershipRepo.getById(teacherId);
      data.teacher = { _id: teacher._id, fullName: teacher.fullName };
    }

    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../../public${leadership.image}`
      );

      fs.unlinkSync(oldImagePath);

      data.image = `/uploads/classes/${req.file.filename}`;
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/classes");
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

    res.redirect("/admin/classes");
  };
}

export default ClasessService;
