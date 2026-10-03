import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { EcosystemController } from "./ecosystem.controller";
import { ClinicalExportService } from "./clinical-export.service";
import { PortalService } from "./portal.service";
import { FeedbackService } from "./feedback.service";
import { HealthSyncService } from "./health-sync.service";
import { VoiceNlpService } from "./voice-nlp.service";
import { RoutineVersionService } from "./routine-version.service";
import { DataPrivacyService } from "./data-privacy.service";
import { LifeStageService } from "./life-stage.service";
import { SeasonalService } from "./seasonal.service";
import { CausalInferenceService } from "./causal-inference.service";

@Module({
  imports: [PrismaModule],
  controllers: [EcosystemController],
  providers: [
    ClinicalExportService,
    PortalService,
    FeedbackService,
    HealthSyncService,
    VoiceNlpService,
    RoutineVersionService,
    DataPrivacyService,
    LifeStageService,
    SeasonalService,
    CausalInferenceService,
  ],
  exports: [
    ClinicalExportService,
    PortalService,
    FeedbackService,
    HealthSyncService,
    VoiceNlpService,
    RoutineVersionService,
    DataPrivacyService,
    LifeStageService,
    SeasonalService,
    CausalInferenceService,
  ],
})
export class EcosystemModule {}
