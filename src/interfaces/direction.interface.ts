import { DirectionStatus } from "@/enums/direction-status.enum";

export interface IDirection {
  _id: string;
  title: string;
  image: string;
  status: DirectionStatus;
  createdAt: Date;
  updatedAt: Date;
}
