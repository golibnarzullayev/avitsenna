import { DirectionStatus } from "@/enums/direction-status.enum";
import { IDirection } from "@/interfaces/direction.interface";
import { model, Schema } from "mongoose";

const directionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(DirectionStatus),
      default: DirectionStatus.Inactive,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IDirection>("direction", directionSchema);
