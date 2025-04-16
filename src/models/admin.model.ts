import { IAdmin } from "@/interfaces/admin.interface";
import { model, Schema } from "mongoose";

const adminSchema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model<IAdmin>("admin", adminSchema);
