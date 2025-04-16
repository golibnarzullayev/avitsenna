import { IRequest } from "@/interfaces";
import UserService from "@/services/user/user.service";
import { Response } from "express";

class UserController {
  private service = new UserService();

  public renderHomePage = async (req: IRequest, res: Response) => {
    this.service.renderHomePage(req, res);
  };

  public renderNewsPage = async (req: IRequest, res: Response) => {
    this.service.renderNewsPage(req, res);
  };

  public renderClassesPage = async (req: IRequest, res: Response) => {
    this.service.renderClassesPage(req, res);
  };

  public renderLeadershipPage = async (req: IRequest, res: Response) => {
    this.service.renderLeadershipPage(req, res);
  };

  public renderSingleNewsPage = async (req: IRequest, res: Response) => {
    this.service.renderSingleNewsPage(req, res);
  };

  public renderGalleriesPage = async (req: IRequest, res: Response) => {
    this.service.renderGalleriesPage(req, res);
  };

  public renderAchievementsPage = async (req: IRequest, res: Response) => {
    this.service.renderAchievementsPage(req, res);
  };

  public applications = async (req: IRequest, res: Response) => {
    this.service.applications(req, res);
  };
}

export default UserController;
