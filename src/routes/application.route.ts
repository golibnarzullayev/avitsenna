import ApplicationController from "@/controllers/application.controller";
import { protectedRoute } from "@/middlewares/check.middleware";
import { Router } from "express";

class ApplicationRoute {
  public path = "/admin/applications";
  public router = Router();
  private controller = new ApplicationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, protectedRoute, this.controller.renderHomePage);
  }
}

export default ApplicationRoute;
