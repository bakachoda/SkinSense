import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { ClinicalReportService, ScanAnalysisContext } from "./clinical-report.service";
import { SmartNotificationService, NotificationCandidate } from "./smart-notification.service";
import { SkinDiaryService } from "./skin-diary.service";
import { RoutineCardService } from "./routine-card.service";
import { CreateDiaryEntryInput, UpdateNotificationPrefsInput } from "@skinsense/types";

@Controller("api/v1/engagement")
export class EngagementController {
  constructor(
    private readonly clinicalReportService: ClinicalReportService,
    private readonly smartNotificationService: SmartNotificationService,
    private readonly skinDiaryService: SkinDiaryService,
    private readonly routineCardService: RoutineCardService,
  ) {}

  // -------------------------------------------------------------
  // Clinical Report Endpoints
  // -------------------------------------------------------------
  @Post("reports/generate")
  @HttpCode(HttpStatus.OK)
  async generateReport(
    @Body() body: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || body.userId || "user-1";
    return this.clinicalReportService.generateReport({ ...body, userId });
  }

  @Get("reports/:scanId")
  async getReport(@Param("scanId") scanId: string) {
    const report = await this.clinicalReportService.getReportByScanId(scanId);
    if (!report) {
      throw new NotFoundException(`Clinical report for scan ${scanId} not found`);
    }
    return report;
  }

  // -------------------------------------------------------------
  // Smart Notification Endpoints
  // -------------------------------------------------------------
  @Get("notifications")
  async getNotifications(@Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.getNotifications(userId);
  }

  @Post("notifications/enqueue")
  async enqueueNotification(
    @Body() candidate: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.enqueueNotification(userId, candidate);
  }

  @Post("notifications/weather-eval")
  async evaluateWeather(
    @Body() weather: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.evaluateWeatherTriggers(userId, weather);
  }

  @Get("notifications/weekly-digest")
  async getWeeklyDigest(@Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.generateWeeklyDigest(userId);
  }

  @Get("notifications/preferences")
  async getPreferences(@Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.getPreferences(userId);
  }

  @Post("notifications/preferences")
  async updatePreferences(
    @Body() updates: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || "user-1";
    return this.smartNotificationService.updatePreferences(userId, updates);
  }

  @Post("notifications/:id/read")
  async markRead(@Param("id") id: string, @Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    const success = await this.smartNotificationService.markAsRead(userId, id);
    return { success };
  }

  // -------------------------------------------------------------
  // Skin Diary Endpoints
  // -------------------------------------------------------------
  @Get("diary")
  async getDiary(@Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    return this.skinDiaryService.getEntries(userId);
  }

  @Post("diary")
  async createDiaryEntry(
    @Body() input: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || "user-1";
    return this.skinDiaryService.createEntry(userId, input);
  }

  @Get("diary/markers")
  async getMarkers(@Headers("x-user-id") userIdHeader?: string) {
    const userId = userIdHeader || "user-1";
    return this.skinDiaryService.getMarkers(userId);
  }

  @Post("diary/markers")
  async addMarker(
    @Body() input: any,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = userIdHeader || "user-1";
    return this.skinDiaryService.addMarker(userId, input);
  }

  // -------------------------------------------------------------
  // Printable Routine Card Endpoints
  // -------------------------------------------------------------
  @Get("routine-card")
  async getRoutineCard(@Query("name") name?: string) {
    return this.routineCardService.generateRoutineCard(name || "Alex");
  }

  @Get("routine-card/html")
  async getRoutineCardHtml(@Query("name") name?: string) {
    const cardData = await this.routineCardService.generateRoutineCard(name || "Alex");
    return this.routineCardService.renderHtmlCard(cardData);
  }
}
