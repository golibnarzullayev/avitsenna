import { NewsStatus } from "@/enums/news-status.enum";

export interface INews {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  image: string;
  views: number;
  postId: string;
  slug: string;
  status: NewsStatus;
  createdAt: Date;
  updatedAt: Date;
}
