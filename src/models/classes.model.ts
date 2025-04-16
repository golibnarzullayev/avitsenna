import { IClasses } from "@/interfaces/classes.interface";
import { model, Schema, Types } from "mongoose";

const classesSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    teacher: {
      type: {
        _id: {
          type: Types.ObjectId,
          required: true,
        },
        fullName: {
          type: String,
          required: true,
        },
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<IClasses>("classes", classesSchema);
