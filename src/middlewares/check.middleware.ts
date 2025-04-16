import { IRequest } from "@/interfaces";
import { NextFunction, Response } from "express";

export const verifyAdmin = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session.isLogged) {
    res.redirect("/admin/dashboard");
    return;
  }

  next();
};

export const protectedRoute = (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.session.isLogged) {
    res.redirect("/auth/admin/login");
    return;
  }

  next();
};
