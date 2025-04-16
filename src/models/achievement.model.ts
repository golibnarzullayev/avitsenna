import { IAchievement } from "@/interfaces/achievement.interface";
import { model, Schema } from "mongoose";

const achievementSchema = new Schema<IAchievement>(
  {
    fullName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IAchievement>("achievement", achievementSchema);
