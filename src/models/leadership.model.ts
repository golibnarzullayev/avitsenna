import { ILeadership } from "@/interfaces/leadership.interface";
import { model, Schema } from "mongoose";

const leadershipSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    isLeader: {
      type: Boolean,
      default: false,
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

export default model<ILeadership>("leadership", leadershipSchema);
