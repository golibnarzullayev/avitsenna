import { environment } from "@/config";
import { AdminRepo } from "@/repository/admin.repo";
import { hashPassword } from "@/utils";

export class SeedService {
  private adminRepo = new AdminRepo();

  public async seed() {
    const fullName = environment.ADMIN_FULLNAME;
    const username = environment.ADMIN_USERNAME;
    const password = environment.ADMIN_PASSWORD;

    try {
      const admin = await this.adminRepo.getOne({ username });
      if (admin) return;

      const hashedPassword = await hashPassword(password);
      await this.adminRepo.create({
        fullName,
        username,
        password: hashedPassword,
      });

      console.log("----------------------");
      console.log("Admin created successfully");
      console.log(`fullName => ${fullName}`);
      console.log(`username => ${username}`);
      console.log(`password => ${password}`);
      console.log("----------------------");
    } catch (error) {
      console.error(error);
    }
  }
}
