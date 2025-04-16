import { BaseRepo } from "@/base/base.repo";
import { IAdmin } from "@/interfaces/admin.interface";
import adminModel from "@/models/admin.model";

export class AdminRepo extends BaseRepo<IAdmin> {
  protected model = adminModel;
}
