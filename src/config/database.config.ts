import { environment } from "@/config/environment.config";
import { connect, set } from "mongoose";

export const connectMongo = async () => {
  try {
    set("strictQuery", false);
    await connect(environment.MONGO_URI);

    console.info(`=====================================`);
    console.info(`       🚀 Connected to Database      `);
    console.info(`=====================================`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
