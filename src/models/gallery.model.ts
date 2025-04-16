import { IGallery } from "@/interfaces/gallery.interface";
import { model, Schema } from "mongoose";

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IGallery>("gallery", gallerySchema);
