import { Module } from "@nestjs/common";
import { EngagementController } from "./engagement.controller";
import { ClinicalReportService } from "./clinical-report.service";
import { SmartNotificationService } from "./smart-notification.service";
import { SkinDiaryService } from "./skin-diary.service";
import { RoutineCardService } from "./routine-card.service";

@Module({
  controllers: [EngagementController],
  providers: [
    ClinicalReportService,
    SmartNotificationService,
    SkinDiaryService,
    RoutineCardService,
  ],
  exports: [
    ClinicalReportService,
    SmartNotificationService,
    SkinDiaryService,
    RoutineCardService,
  ],
})
export class EngagementModule {}
