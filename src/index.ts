import { Server } from "./server";

import AuthRoute from "@/routes/auth.route";
import AdminRoute from "@/routes/admin.route";
import LeadershipRoute from "@/routes/leadership.route";
import ClassesRoute from "@/routes/classes.route";
import DirectionRoute from "@/routes/direction.route";
import UserRoute from "@/routes/user.route";
import NewsRoute from "@/routes/news.route";
import ApplicationRoute from "@/routes/application.route";
import GalleryRoute from "./routes/gallery.route";

(async () => {
  try {
    const server = new Server();
    await server.initialize([
      new UserRoute(),
      new AuthRoute(),
      new AdminRoute(),
      new LeadershipRoute(),
      new ClassesRoute(),
      new DirectionRoute(),
      new NewsRoute(),
      new ApplicationRoute(),
      new GalleryRoute(),
    ]);
    await server.run();
  } catch (error) {
    console.error(error);
  }
})();
