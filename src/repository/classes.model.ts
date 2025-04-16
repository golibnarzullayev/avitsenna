import { BaseRepo } from "@/base/base.repo";
import { IClasses } from "@/interfaces/classes.interface";
import classesModel from "@/models/classes.model";

export class ClassesRepo extends BaseRepo<IClasses> {
  protected model = classesModel;
}
