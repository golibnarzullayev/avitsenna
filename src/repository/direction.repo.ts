import { BaseRepo } from "@/base/base.repo";
import { IDirection } from "@/interfaces/direction.interface";
import directionModel from "@/models/direction.model";

export class DirectionRepo extends BaseRepo<IDirection> {
  protected model = directionModel;
}
