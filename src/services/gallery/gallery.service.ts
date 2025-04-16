import { IPagedResult, IRequest } from "@/interfaces";
import { ILeadership } from "@/interfaces/leadership.interface";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { OrderBy } from "@/enums/mongo-query.enum";
import { GalleryRepo } from "@/repository/gallery.repo";
import { IGallery } from "@/interfaces/gallery.interface";

class GalleryService {
  private repo = new GalleryRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/galleries") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<IGallery>>(pipeline);

    res.render("admin/galleries/index", {
      title: "Boshqaruv paneli - Fotosuratlar",
      activeUrl: "/admin/galleries",
      pageTitle: "Fotosuratlar",
      admin,
      galleries: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    res.render("admin/galleries/add", {
      title: "Boshqaruv paneli - Yangi fotosurat qo'shish",
      pageTitle: "Fotosurat qo'shish",
      activeUrl: "/admin/galleries",
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const { title, description } = req.body;
    const fileName = req.file.filename;

    await this.repo.create({
      title,
      description,
      image: `/uploads/galleries/${fileName}`,
    });

    res.redirect("/admin/galleries");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const gallery = await this.repo.getById(id);

    res.render("admin/galleries/edit", {
      title: "Boshqaruv paneli - Fotosuratni tahrirlash",
      pageTitle: "Fotosuratni tahrirlash",
      activeUrl: "/admin/galleries",
      admin,
      updateErr: req.flash("updateErr")[0],
      gallery,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<IGallery> = {};
    const { title, description } = req.body;

    const gallery = await this.repo.getById(id);

    if (title) data.title = title;
    if (description) data.description = description;

    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../../public${gallery.image}`
      );

      fs.unlinkSync(oldImagePath);

      data.image = `/uploads/galleries/${req.file.filename}`;
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/galleries");
  };

  public delete = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const gallery = await this.repo.getById(id);
    const oldImagePath = path.join(
      __dirname,
      `../../../public${gallery.image}`
    );
    fs.unlinkSync(oldImagePath);

    await this.repo.deleteById(id);

    res.redirect("/admin/galleries");
  };
}

export default GalleryService;
