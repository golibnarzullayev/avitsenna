import { AdminRepo } from "@/repository/admin.repo";
import { SignInDto } from "./auth.dto";
import { Response } from "express";
import { validPassword } from "@/utils";
import { IRequest } from "@/interfaces";

class AuthService {
  private adminRepo = new AdminRepo();

  public async signInPage(req: IRequest, res: Response): Promise<void> {
    try {
      const regErr = req.flash("signinError")[0];
      res.render("auth/login", {
        title: "Tizimga kirish",
        regErr: regErr,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  public async signIn(
    req: IRequest,
    res: Response,
    data: SignInDto
  ): Promise<void> {
    try {
      const { password, username } = data;

      const admin = await this.adminRepo.getOne({ username });
      if (!admin) {
        req.flash(
          "signinError",
          "Foydalanuvchi foydalanuvchi nomi yoki paroli notog'ri"
        );
        res.redirect("/auth/admin/login");
        return;
      }

      const isValid = await validPassword(password, admin.password);
      if (!isValid) {
        req.flash(
          "signinError",
          "Foydalanuvchi foydalanuvchi nomi yoki paroli notog'ri"
        );
        res.redirect("/auth/admin/login");
        return;
      }

      req.session.isLogged = true;
      req.session.admin = admin;
      res.redirect("/admin/dashboard");
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default AuthService;
