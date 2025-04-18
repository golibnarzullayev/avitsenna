import { BaseRepo } from "@/base/base.repo";
import { OrderDirection } from "@/enums/order-direction.enum";
import { ILeadership } from "@/interfaces/leadership.interface";
import leadershipModel from "@/models/leadership.model";

export class LeadershipRepo extends BaseRepo<ILeadership> {
  protected model = leadershipModel;

  public getGreatestOrder = async (): Promise<number> => {
    const leaderShip = await this.model.findOne().sort("-order");

    return leaderShip?.order;
  };

  public updateOrder = async (
    orderDirection: OrderDirection,
    orderFilter: object
  ): Promise<void> => {
    await this.model.updateMany(
      { order: orderFilter },
      { $inc: { order: orderDirection } }
    );
  };
}
