import { BaseRepo } from "@/base/base.repo";
import { IAchievement } from "@/interfaces/achievement.interface";
import achievementModel from "@/models/achievement.model";

export class AchievementRepo extends BaseRepo<IAchievement> {
  protected model = achievementModel;
}
