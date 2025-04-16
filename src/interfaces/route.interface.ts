import { Router, Request } from "express";
import session from "express-session";
import { IAdmin } from "./admin.interface";

export interface IRoute {
  path: string;
  router: Router;
}

export interface IRequest extends Request {
  session: session.Session &
    Partial<
      session.SessionData & {
        isLogged: boolean;
        admin: IAdmin;
      }
    >;
}
