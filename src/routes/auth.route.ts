import AuthController from "@/controllers/auth.controller";
import { verifyAdmin } from "@/middlewares/check.middleware";
import { Router } from "express";

class AuthRoute {
  public path = "/auth";
  public router: Router = Router();
  private authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      `${this.path}/admin/login`,
      verifyAdmin,
      this.authController.signInPage
    );
    this.router.post(
      `${this.path}/admin/login`,
      verifyAdmin,
      this.authController.signIn
    );
  }
}

export default AuthRoute;
