import { IPagedResult, IRequest } from "@/interfaces";
import { ILeadership } from "@/interfaces/leadership.interface";
import { LeadershipRepo } from "@/repository/leadership.repo";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";
import path from "node:path";
import fs from "node:fs";
import { OrderBy } from "@/enums/mongo-query.enum";
import _ from "lodash";
import { OrderDirection } from "@/enums/order-direction.enum";

class LeadershipService {
  private repo = new LeadershipRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    if (req.url === "/admin/leadership") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .searching("fullName")
      .sorting("createdAt", OrderBy.Desc)
      .paginating()
      .getPipeline();

    const result = await this.repo.aggregate<IPagedResult<ILeadership>>(
      pipeline
    );

    res.render("admin/leadership/index", {
      title: "Boshqaruv paneli - rahbariyat",
      activeUrl: "/admin/leadership",
      pageTitle: "Rahbariyat",
      admin,
      leaderships: result.data,
      pageCount: Math.ceil(result.totalCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.totalCount / 10),
      },
    });
  };

  public renderAddPage = (req: IRequest, res: Response) => {
    const admin = req.session.admin;

    res.render("admin/leadership/add", {
      title: "Boshqaruv paneli - Rahbariyatga a'zo qo'shish",
      pageTitle: "Rahbariyat qo'shish",
      activeUrl: "/admin/leadership",
      admin,
      addErr: req.flash("addErr")[0],
    });
  };

  public create = async (req: IRequest, res: Response) => {
    const { fullName, position, isLeader, description } = req.body;
    const fileName = req.file.filename;

    const greatestOrder = await this.repo.getGreatestOrder();
    const order = _.isNil(greatestOrder) ? 0 : greatestOrder + 1;

    await this.repo.create({
      fullName,
      position,
      isLeader: isLeader === "on",
      description,
      image: `/uploads/leaderships/${fileName}`,
      order,
    });

    res.redirect("/admin/leadership");
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    const admin = req.session.admin;
    const id = req.params.id;

    const leadership = await this.repo.getById(id);

    res.render("admin/leadership/edit", {
      title: "Boshqaruv paneli - Rahbariyat a'zosi ma'lumotlarini tahrirlash",
      pageTitle: "Rahbariyat tahrirlash",
      activeUrl: "/admin/leadership",
      admin,
      updateErr: req.flash("updateErr")[0],
      leadership,
    });
  };

  public edit = async (req: IRequest, res: Response) => {
    const id = req.params.id;

    const data: Partial<ILeadership> = {};
    const { fullName, position, isLeader, description, order } = req.body;
    console.log(order);

    const leadership = await this.repo.getById(id);

    if (fullName) data.fullName = fullName;
    if (position) data.position = position;
    if (isLeader) data.isLeader = isLeader === "on";
    if (description) data.description = description;

    if (req.file) {
      const oldImagePath = path.join(
        __dirname,
        `../../../public${leadership.image}`
      );

      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }

      data.image = `/uploads/leaderships/${req.file.filename}`;
    }

    if (!_.isNil(order)) {
      if (leadership.order > Number(order)) {
        const orderFilter = { $gte: order, $lt: leadership.order };

        await this.repo.updateOrder(OrderDirection.Increment, orderFilter);
      }

      if (leadership.order < Number(order)) {
        const orderFilter = { $gt: leadership.order, $lte: order };

        await this.repo.updateOrder(OrderDirection.Decrement, orderFilter);
      }
    }

    await this.repo.updateById(id, data);

    res.redirect("/admin/leadership");
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

    res.redirect("/admin/leadership");
  };
}

export default LeadershipService;
