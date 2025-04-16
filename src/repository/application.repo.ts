import { BaseRepo } from "@/base/base.repo";
import { IApplication } from "@/interfaces/application.interface";
import applicationModel from "@/models/application.model";

export class ApplicationRepo extends BaseRepo<IApplication> {
  protected model = applicationModel;
}
