import { Module } from "@nestjs/common";
import { FitzpatrickService } from "./fitzpatrick.service";
import { ReclassificationService } from "./reclassification.service";
import { EnsembleService } from "./ensemble.service";
import { DifferentialService } from "./differential.service";
import { SafetyScreeningService } from "./safety-screening.service";
import { BarrierService } from "./barrier.service";
import { SkinAgeService } from "./skin-age.service";
import { ClinicalGradingService } from "./clinical-grading.service";
import { SelfAuditService } from "./self-audit.service";
import { EnvironmentalService } from "./environmental.service";
import { EnvironmentalController } from "./environmental.controller";

@Module({
  controllers: [EnvironmentalController],
  providers: [
    FitzpatrickService,
    ReclassificationService,
    EnsembleService,
    DifferentialService,
    SafetyScreeningService,
    BarrierService,
    SkinAgeService,
    ClinicalGradingService,
    SelfAuditService,
    EnvironmentalService,
  ],
  exports: [
    FitzpatrickService,
    ReclassificationService,
    EnsembleService,
    DifferentialService,
    SafetyScreeningService,
    BarrierService,
    SkinAgeService,
    ClinicalGradingService,
    SelfAuditService,
    EnvironmentalService,
  ],
})
export class SmartEngineModule {}
