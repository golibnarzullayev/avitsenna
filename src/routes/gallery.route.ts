import GalleryController from "@/controllers/gallery.controller";
import { protectedRoute } from "@/middlewares/check.middleware";
import { upload } from "@/utils/fileupload.util";
import { Router } from "express";

class GalleryRoute {
  public path = "/admin/galleries";
  public router: Router = Router();
  private controller = new GalleryController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, protectedRoute, this.controller.renderHomePage);
    this.router.get(
      `${this.path}/add`,
      protectedRoute,
      this.controller.renderAddPage
    );
    this.router.post(
      `${this.path}/add`,
      protectedRoute,
      upload("galleries").single("image"),
      this.controller.create
    );
    this.router.get(
      `${this.path}/edit/:id`,
      protectedRoute,
      this.controller.renderEditPage
    );
    this.router.post(
      `${this.path}/edit/:id`,
      protectedRoute,
      upload("galleries").single("image"),
      this.controller.edit
    );

    this.router.delete(
      `${this.path}/:id`,
      protectedRoute,
      this.controller.delete
    );
  }
}

export default GalleryRoute;
