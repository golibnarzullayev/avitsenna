import { IRequest } from "@/interfaces";
import AuthService from "@/services/auth/auth.service";
import { Response } from "express";

class AuthController {
  private authService = new AuthService();

  public signInPage = async (req: IRequest, res: Response) => {
    this.authService.signInPage(req, res);
  };

  public signIn = async (req: IRequest, res: Response) => {
    this.authService.signIn(req, res, req.body);
  };
}

export default AuthController;
