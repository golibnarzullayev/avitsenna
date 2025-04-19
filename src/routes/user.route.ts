import SitemapController from "@/controllers/sitemap.controller";
import UserController from "@/controllers/user.controller";
import { Router } from "express";

class UserRoute {
  public path = "";
  public router: Router = Router();
  private controller = new UserController();
  private sitemapController = new SitemapController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/`, this.controller.renderHomePage);
    this.router.get(`${this.path}/news`, this.controller.renderNewsPage);
    this.router.get(`${this.path}/classes`, this.controller.renderClassesPage);
    this.router.get(
      `${this.path}/leaderships`,
      this.controller.renderLeadershipPage
    );
    this.router.get(
      `${this.path}/news/slug`,
      this.controller.renderSingleNewsPage
    );
    this.router.get(
      `${this.path}/galleries`,
      this.controller.renderGalleriesPage
    );
    this.router.get(
      `${this.path}/achievements`,
      this.controller.renderAchievementsPage
    );
    this.router.post(`${this.path}/applications`, this.controller.applications);
    this.router.get(
      `${this.path}/sitemap.xml`,
      this.sitemapController.generateSitemap
    );
  }
}

export default UserRoute;
