import { IRequest } from "@/interfaces";
import NewsService from "@/services/news/news.service";
import { Response } from "express";

class NewsController {
  private service = new NewsService();

  public renderHomePage = async (req: IRequest, res: Response) => {
    try {
      await this.service.renderHomePage(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public renderAddPage = async (req: IRequest, res: Response) => {
    try {
      this.service.renderAddPage(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public create = async (req: IRequest, res: Response) => {
    try {
      this.service.create(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public renderEditPage = async (req: IRequest, res: Response) => {
    try {
      this.service.renderEditPage(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public edit = async (req: IRequest, res: Response) => {
    try {
      this.service.edit(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public delete = async (req: IRequest, res: Response) => {
    try {
      this.service.delete(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default NewsController;
