import { Controller, Get, Post, Body, Query, UseGuards, Req, Param } from "@nestjs/common";
import { TemporalAnalyticsService } from "./temporal-analytics.service";
import { SkinTwinService } from "./skin-twin.service";
import { LifestyleCorrelationService } from "./lifestyle-correlation.service";
import { AchievementService } from "./achievement.service";
import type { TrendWindow, CreateLifestyleLog } from "@skinsense/types";

@Controller("longitudinal")
export class LongitudinalController {
  constructor(
    private temporalAnalytics: TemporalAnalyticsService,
    private skinTwin: SkinTwinService,
    private lifestyleCorrelation: LifestyleCorrelationService,
    private achievements: AchievementService,
  ) {}

  // ── Timeline ──

  @Get("timeline")
  async getTimeline(
    @Query("userId") userId: string,
    @Query("window") window: TrendWindow = "30d",
  ) {
    const timeline = await this.temporalAnalytics.buildTimeline(userId, window);
    return { timeline, window };
  }

  // ── Skin Twin ──

  @Get("skin-twin")
  async getSkinTwin(@Query("userId") userId: string) {
    const skinTwin = await this.skinTwin.findSkinTwin(userId);
    return { skinTwin };
  }

  // ── Lifestyle ──

  @Post("lifestyle/check-in")
  async logCheckIn(
    @Query("userId") userId: string,
    @Body() body: CreateLifestyleLog,
  ) {
    const log = await this.lifestyleCorrelation.logCheckIn(userId, body);
    // Evaluate achievements after check-in
    const newBadges = await this.achievements.evaluateAchievements(userId);
    return { log, newBadges };
  }

  @Get("lifestyle/check-ins")
  async getCheckIns(
    @Query("userId") userId: string,
    @Query("days") days: string = "30",
  ) {
    const logs = await this.lifestyleCorrelation.getCheckIns(userId, parseInt(days, 10));
    return { logs };
  }

  @Get("lifestyle/insights")
  async getInsights(@Query("userId") userId: string) {
    const insights = await this.lifestyleCorrelation.computeInsights(userId);
    return { insights };
  }

  // ── Achievements ──

  @Get("achievements")
  async getAchievements(@Query("userId") userId: string) {
    const progress = await this.achievements.getProgress(userId);
    return { progress };
  }

  @Post("achievements/evaluate")
  async evaluateAchievements(@Query("userId") userId: string) {
    const newlyUnlocked = await this.achievements.evaluateAchievements(userId);
    return { newlyUnlocked };
  }

  @Post("achievements/mark-seen")
  async markSeen(@Query("userId") userId: string) {
    await this.achievements.markSeen(userId);
    return { ok: true };
  }
}
