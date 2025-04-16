import { BaseRepo } from "@/base/base.repo";
import { INews } from "@/interfaces/news.interface";
import newsModel from "@/models/news.model";

export class NewsRepo extends BaseRepo<INews> {
  protected model = newsModel;
}
