import { BaseRepo } from "@/base/base.repo";
import { ILeadership } from "@/interfaces/leadership.interface";
import leadershipModel from "@/models/leadership.model";

export class LeadershipRepo extends BaseRepo<ILeadership> {
  protected model = leadershipModel;
}
