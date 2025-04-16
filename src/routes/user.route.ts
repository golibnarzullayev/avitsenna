import UserController from "@/controllers/user.controller";
import { Router } from "express";

class UserRoute {
  public path = "";
  public router = Router();
  private controller = new UserController();

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
    this.router.post(`${this.path}/applications`, this.controller.applications);
  }
}

export default UserRoute;
