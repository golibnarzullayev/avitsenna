import express from "express";
import { connectMongo, environment } from "@/config";

import path from "node:path";

import { engine } from "express-handlebars";
import Handlebars from "handlebars";
import flash from "express-flash";
import session from "express-session";
import MongoStore from "connect-mongodb-session";
import cookieParser from "cookie-parser";
import cors from "cors";

import { hbsHelpers } from "@/utils";
import { IRoute } from "@/interfaces";
import { SeedService } from "./seed";

export class Server {
  private app: express.Application;
  private port: number;
  private env: string;

  constructor(routes?: IRoute[]) {
    this.app = express();
    this.port = environment.PORT;
    this.env = environment.NODE_ENV;

    routes;
  }

  public async run(): Promise<void> {
    this.app.listen(this.port);

    console.info(`=====================================`);
    console.info(`           ENV: ${this.env}          `);
    console.info(`  🚀 App listening on the port ${this.port}  `);
    console.info(`=====================================`);
  }

  public async initialize(routes: IRoute[]): Promise<void> {
    this.initializeMiddlewares();
    this.initializeDatabase();
    this.initializeRoutes(routes);

    await new SeedService().seed();
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(
      session({
        secret: environment.SESSION_SECRET,
        resave: true,
        saveUninitialized: true,
        store: this.initializeStore(),
      })
    );
    hbsHelpers(Handlebars);
    this.app.use(flash());
    this.app.use(express.static("public"));

    this.app.engine("hbs", engine({ extname: "hbs" }));
    this.app.set("view engine", "hbs");
    this.app.set("views", path.join(__dirname, "views"));
  }

  private initializeStore() {
    const MongoDBStore = MongoStore(session);

    return new MongoDBStore({
      uri: environment.MONGO_URI,
      collection: "sessions",
    });
  }

  private initializeRoutes(routes: IRoute[]) {
    this.app.use(
      "/tinymce",
      express.static(path.join(__dirname, "..", "node_modules", "tinymce"))
    );
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });

    this.app.use("*", (req, res) => {
      res.render("pages/404");
    });
  }

  private async initializeDatabase() {
    await connectMongo();
  }
}
