import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Header,
} from "@nestjs/common";
import { SupabaseAuthGuard } from "../common/guards/supabase-auth.guard";
import { ClinicalExportService } from "./clinical-export.service";
import { PortalService } from "./portal.service";
import { FeedbackService } from "./feedback.service";
import type { DiagnosisFeedbackSubmission } from "./feedback.service";
import { HealthSyncService } from "./health-sync.service";
import { VoiceNlpService } from "./voice-nlp.service";
import { RoutineVersionService } from "./routine-version.service";
import { DataPrivacyService } from "./data-privacy.service";
import { LifeStageService } from "./life-stage.service";
import { SeasonalService } from "./seasonal.service";
import { CausalInferenceService } from "./causal-inference.service";
import type { HealthSyncPayload, DataResidencyRegion, LifeStage } from "@skinsense/types";

@Controller("api")
export class EcosystemController {
  constructor(
    private readonly clinicalExportService: ClinicalExportService,
    private readonly portalService: PortalService,
    private readonly feedbackService: FeedbackService,
    private readonly healthSyncService: HealthSyncService,
    private readonly voiceNlpService: VoiceNlpService,
    private readonly routineVersionService: RoutineVersionService,
    private readonly dataPrivacyService: DataPrivacyService,
    private readonly lifeStageService: LifeStageService,
    private readonly seasonalService: SeasonalService,
    private readonly causalInferenceService: CausalInferenceService,
  ) {}

  // ── Clinical Export ──

  @Get("export/clinical")
  @UseGuards(SupabaseAuthGuard)
  async getClinicalExport(@Req() req: any) {
    const userId = req.user.id;
    return this.clinicalExportService.buildClinicalExport(userId);
  }

  @Get("export/clinical/html")
  @UseGuards(SupabaseAuthGuard)
  @Header("Content-Type", "text/html")
  async getClinicalExportHtml(@Req() req: any) {
    const userId = req.user.id;
    return this.clinicalExportService.generateHtmlReport(userId);
  }

  // ── Dermatologist Portal (Patient actions) ──

  @Post("portal/access")
  @UseGuards(SupabaseAuthGuard)
  async createPortalInvite(@Req() req: any) {
    const userId = req.user.id;
    return this.portalService.createInviteLink(userId);
  }

  @Get("portal/access")
  @UseGuards(SupabaseAuthGuard)
  async listPortalInvites(@Req() req: any) {
    const userId = req.user.id;
    return this.portalService.listUserLinks(userId);
  }

  @Delete("portal/access/:id")
  @UseGuards(SupabaseAuthGuard)
  async revokePortalInvite(@Req() req: any, @Param("id") id: string) {
    const userId = req.user.id;
    await this.portalService.revokeInviteLink(userId, id);
    return { success: true };
  }

  // ── Dermatologist Portal (Clinician actions - Token Auth) ──

  @Get("portal/patient/:accessToken/summary")
  async getPortalPatientSummary(@Param("accessToken") accessToken: string) {
    return this.portalService.getPatientSummary(accessToken);
  }

  @Post("portal/patient/:accessToken/notes")
  async addClinicianNote(
    @Param("accessToken") accessToken: string,
    @Body() body: { message: string; clinicianName?: string },
  ) {
    return this.portalService.addClinicianNote(accessToken, body.message, body.clinicianName);
  }

  @Post("portal/patient/:accessToken/photo-request")
  async requestPhoto(
    @Param("accessToken") accessToken: string,
    @Body() body: { zone: string; reason: string; instructions: string },
  ) {
    return this.portalService.requestPhoto(accessToken, body.zone, body.reason, body.instructions);
  }

  // ── Feedback Loop ──

  @Post("feedback/diagnosis")
  @UseGuards(SupabaseAuthGuard)
  async submitDiagnosisFeedback(
    @Req() req: any,
    @Body() body: DiagnosisFeedbackSubmission,
  ) {
    const userId = req.user.id;
    return this.feedbackService.submitDiagnosisFeedback(userId, body);
  }

  // ── Health Sync ──

  @Post("health/sync")
  @UseGuards(SupabaseAuthGuard)
  async syncHealth(@Req() req: any, @Body() body: HealthSyncPayload) {
    const userId = req.user.id;
    return this.healthSyncService.syncHealthData(userId, body);
  }

  @Get("health/score")
  @UseGuards(SupabaseAuthGuard)
  async getScoreForHealthApp(@Req() req: any) {
    const userId = req.user.id;
    return this.healthSyncService.getScoreForHealthAppExport(userId);
  }

  // ── Voice NLP ──

  @Post("voice/extract")
  @UseGuards(SupabaseAuthGuard)
  async extractVoiceSignals(@Body() body: { transcript: string }) {
    return this.voiceNlpService.extractSignalsFromTranscript(body.transcript);
  }

  // ── Routine History ──

  @Get("routines/:id/history")
  @UseGuards(SupabaseAuthGuard)
  async getRoutineHistory(@Req() req: any, @Param("id") routineId: string) {
    const userId = req.user.id;
    return this.routineVersionService.getHistory(userId, routineId);
  }

  // ── Data Portability & Deletion ──

  @Post("export")
  @UseGuards(SupabaseAuthGuard)
  async generateFullExport(@Req() req: any) {
    const userId = req.user.id;
    return this.dataPrivacyService.generateDataExport(userId);
  }

  @Delete("account")
  @UseGuards(SupabaseAuthGuard)
  async deleteAccount(@Req() req: any) {
    const userId = req.user.id;
    return this.dataPrivacyService.deleteAccount(userId);
  }

  // ── Multi-Profile Management ──

  @Post("profiles")
  @UseGuards(SupabaseAuthGuard)
  async createProfile(
    @Req() req: any,
    @Body() body: { displayName: string; avatarUri?: string; biometricLockEnabled?: boolean },
  ) {
    const userId = req.user.id;
    return this.dataPrivacyService.createProfile(
      userId,
      body.displayName,
      body.avatarUri,
      body.biometricLockEnabled,
    );
  }

  @Get("profiles")
  @UseGuards(SupabaseAuthGuard)
  async listProfiles(@Req() req: any) {
    const userId = req.user.id;
    return this.dataPrivacyService.listProfiles(userId);
  }

  @Post("profiles/:id/switch")
  @UseGuards(SupabaseAuthGuard)
  async switchProfile(@Req() req: any, @Param("id") id: string) {
    const userId = req.user.id;
    return this.dataPrivacyService.switchProfile(userId, id);
  }

  @Delete("profiles/:id")
  @UseGuards(SupabaseAuthGuard)
  async deleteProfile(@Req() req: any, @Param("id") id: string) {
    const userId = req.user.id;
    await this.dataPrivacyService.deleteProfile(userId, id);
    return { success: true };
  }

  // ── Life-Stage Adaptation ──

  @Get("life-stage/adaptation")
  @UseGuards(SupabaseAuthGuard)
  async getLifeStageAdaptation(@Req() req: any) {
    const lifeStage = (req.user.lifeStage as LifeStage) || "NONE";
    return this.lifeStageService.getLifeStageAdaptation(lifeStage);
  }
}
