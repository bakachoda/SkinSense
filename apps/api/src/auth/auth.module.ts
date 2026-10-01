import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { ProfileController } from "./profile.controller";
import { AuthService } from "./auth.service";

@Module({
  controllers: [AuthController, ProfileController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
