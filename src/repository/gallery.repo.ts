import { BaseRepo } from "@/base/base.repo";
import { IGallery } from "@/interfaces/gallery.interface";
import galleryModel from "@/models/gallery.model";

export class GalleryRepo extends BaseRepo<IGallery> {
  protected model = galleryModel;
}
