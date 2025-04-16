import { IRequest } from "@/interfaces";
import ApplicationService from "@/services/application/application.service";
import { Response } from "express";

class ApplicationController {
  private service = new ApplicationService();

  public renderHomePage = async (req: IRequest, res: Response) => {
    try {
      await this.service.renderHomePage(req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default ApplicationController;
