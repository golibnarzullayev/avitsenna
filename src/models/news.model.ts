import { NewsStatus } from "@/enums/news-status.enum";
import { INews } from "@/interfaces/news.interface";
import { model, Schema } from "mongoose";

const newsSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      max: 1000000,
    },
    image: {
      type: String,
      required: true,
    },
    views: {
      type: Number,
      required: true,
      default: 0,
    },
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(NewsStatus),
      default: NewsStatus.Inactive,
    },
  },
  {
    timestamps: true,
  }
);

export default model<INews>("news", newsSchema);
