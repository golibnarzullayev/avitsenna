import { IApplication } from "@/interfaces/application.interface";
import { model, Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: { type: String, required: true },
    phone: { type: String, required: true },
    age: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model<IApplication>("application", applicationSchema);
