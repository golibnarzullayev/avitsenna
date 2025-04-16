import { IRequest } from "@/interfaces";
import { Response } from "express";

class AdminService {
  public renderAdminPage = (req: IRequest, res: Response) => {
    try {
      const admin = req.session.admin;

      res.render("admin/home", {
        title: "Boshqaruv paneli - Bosh sahifa",
        activeUrl: "/admin/dashboard",
        admin,
        protocol: req.protocol,
        host: req.get("host"),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  public logout = (req: IRequest, res: Response) => {
    try {
      req.session.isLogged = false;
      req.session.admin = undefined;
      req.session.destroy(() => {});
      res.redirect("/auth/admin/login");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default AdminService;
