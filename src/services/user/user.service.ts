import { OrderBy } from "@/enums/mongo-query.enum";
import { NewsStatus } from "@/enums/news-status.enum";
import { IPagedResult, IRequest } from "@/interfaces";
import { IAchievement } from "@/interfaces/achievement.interface";
import { IClasses } from "@/interfaces/classes.interface";
import { IGallery } from "@/interfaces/gallery.interface";
import { ILeadership } from "@/interfaces/leadership.interface";
import { INews } from "@/interfaces/news.interface";
import { AchievementRepo } from "@/repository/achievement.repo";
import { ApplicationRepo } from "@/repository/application.repo";
import { ClassesRepo } from "@/repository/classes.model";
import { GalleryRepo } from "@/repository/gallery.repo";
import { LeadershipRepo } from "@/repository/leadership.repo";
import { NewsRepo } from "@/repository/news.repo";
import MongoQueryService from "@/utils/mongo-query.util";
import { Response } from "express";

class UserService {
  private newsRepo = new NewsRepo();
  private classesRepo = new ClassesRepo();
  private leadershipRepo = new LeadershipRepo();
  private applicationRepo = new ApplicationRepo();
  private galleryRepo = new GalleryRepo();
  private achievementRepo = new AchievementRepo();

  public renderHomePage = async (req: IRequest, res: Response) => {
    const news = await this.newsRepo.getMany(
      { status: NewsStatus.Active },
      {
        orderBy: OrderBy.Desc,
        sortBy: "createdAt",
        limit: 12,
      }
    );

    const [first, ...rest] = news;

    res.render("home", {
      news: rest,
      latest: first,
      title: "Avitsenna School — zamonaviy ta'lim muassasasi.",
    });
  };

  public renderNewsPage = async (req: IRequest, res: Response) => {
    if (req.url === "/news") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService(req.query)
      .searching("title,description,shortDescription")
      .filtering({}, { status: NewsStatus.Active })
      .paginating()
      .sorting("createdAt", OrderBy.Desc)
      .getPipeline();

    const result = await this.newsRepo.aggregate<IPagedResult<INews>>(pipeline);

    res.render("news", {
      title: "Avitsenna School — Yangiliklar.",
      news: result.data,
      pageCount: Math.ceil(result.resultCount / 10),
      pagination: {
        page: parseInt(req.query.page as string),
        pageCount: Math.ceil(result.resultCount / 10),
      },
    });
  };

  public renderClassesPage = async (req: IRequest, res: Response) => {
    if (req.url === "/classes") {
      return res.redirect(`?page=1`);
    }

    const pipeline = new MongoQueryService({ ...req.query, limit: "all" })
      .paginating()
      .sorting("createdAt", OrderBy.Desc)
      .getPipeline();

    const result = await this.classesRepo.aggregate<IPagedResult<IClasses>>(
      pipeline
    );

    res.render("classes", {
      classes: result.data,
      title: "Avitsenna School — Sinflar.",
    });
  };

  public renderLeadershipPage = async (req: IRequest, res: Response) => {
    const pipelineLeader = new MongoQueryService({ ...req.query, limit: "all" })
      .paginating()
      .filtering({}, { isLeader: true })
      .sorting("createdAt", OrderBy.Asc)
      .getPipeline();

    const pipelineTeacher = new MongoQueryService({
      ...req.query,
      limit: "all",
    })
      .paginating()
      .filtering({}, { isLeader: false })
      .sorting("createdAt", OrderBy.Asc)
      .getPipeline();

    const resultLeader = await this.leadershipRepo.aggregate<
      IPagedResult<ILeadership>
    >(pipelineLeader);

    const resultTeacher = await this.leadershipRepo.aggregate<
      IPagedResult<ILeadership>
    >(pipelineTeacher);

    res.render("leaderships", {
      leaderships: resultLeader.data,
      teachers: resultTeacher.data,
      title: "Avitsenna School — Rahbariyat.",
    });
  };

  public renderSingleNewsPage = async (req: IRequest, res: Response) => {
    let news = await this.newsRepo.getOne({ slug: req.params.slug });
    if (!news) return res.redirect("/404");

    news = await this.newsRepo.updateById(
      news._id,
      { $inc: { views: 1 } },
      { returnDocs: true }
    );

    const lastestNews = await this.newsRepo.getMany(
      { _id: { $ne: news._id } },
      {
        orderBy: OrderBy.Desc,
        sortBy: "createdAt",
        limit: 8,
      }
    );

    res.render("single-news", {
      news,
      lastestNews,
      title: news.title,
      shortDescription: news.shortDescription,
      imageUrl: `https://avitsennamaktabi.uz/${news.image}`,
      blogUrl: `https://avitsennamaktabi.uz/news/${news.slug}`,
    });
  };

  public renderGalleriesPage = async (req: IRequest, res: Response) => {
    const pipeline = new MongoQueryService({ ...req.query, limit: "all" })
      .paginating()
      .sorting("createdAt", OrderBy.Desc)
      .getPipeline();

    const result = await this.galleryRepo.aggregate<IPagedResult<IGallery>>(
      pipeline
    );

    res.render("gallery", {
      title: "Avitsenna School — Fotosuratlar.",
      galleries: result.data,
    });
  };

  public renderAchievementsPage = async (req: IRequest, res: Response) => {
    const pipeline = new MongoQueryService({ ...req.query, limit: "all" })
      .paginating()
      .sorting("createdAt", OrderBy.Desc)
      .getPipeline();

    const result = await this.achievementRepo.aggregate<
      IPagedResult<IAchievement>
    >(pipeline);

    res.render("achievements", {
      title: "Avitsenna School — Yutuqlar.",
      achievements: result.data,
    });
  };

  public applications = async (req: IRequest, res: Response) => {
    try {
      const { firstName, lastName, middleName, phone, age } = req.body;

      await this.applicationRepo.create({
        firstName,
        lastName,
        middleName,
        phone,
        age,
      });

      res.redirect("/#applications");
    } catch (error) {
      res.status(500).json({ error: error });
    }
  };
}

export default UserService;
