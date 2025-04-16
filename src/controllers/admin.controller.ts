import { IRequest } from "@/interfaces";
import AdminService from "@/services/admin/admin.service";
import { Response } from "express";

class AdminController {
  private adminService = new AdminService();

  public renderAdminPage = async (req: IRequest, res: Response) => {
    this.adminService.renderAdminPage(req, res);
  };

  public logout = async (req: IRequest, res: Response) => {
    this.adminService.logout(req, res);
  };
}

export default AdminController;
