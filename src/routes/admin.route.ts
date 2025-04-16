import AdminController from "@/controllers/admin.controller";
import { protectedRoute } from "@/middlewares/check.middleware";
import { Router } from "express";

class AdminRoute {
  public path = "/admin";
  public router: Router = Router();
  private adminController = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/dashboard`,
      protectedRoute,
      this.adminController.renderAdminPage
    );
    this.router.get(
      `${this.path}/logout`,
      protectedRoute,
      this.adminController.logout
    );
  }
}

export default AdminRoute;
