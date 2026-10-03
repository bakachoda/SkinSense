import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { TemporalAnalyticsService } from "./temporal-analytics.service";
import { SkinTwinService } from "./skin-twin.service";
import { LifestyleCorrelationService } from "./lifestyle-correlation.service";
import { AchievementService } from "./achievement.service";
import { LongitudinalController } from "./longitudinal.controller";

@Module({
  imports: [PrismaModule],
  controllers: [LongitudinalController],
  providers: [
    TemporalAnalyticsService,
    SkinTwinService,
    LifestyleCorrelationService,
    AchievementService,
  ],
  exports: [
    TemporalAnalyticsService,
    SkinTwinService,
    LifestyleCorrelationService,
    AchievementService,
  ],
})
export class LongitudinalModule {}
