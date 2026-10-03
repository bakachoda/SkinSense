import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type {
  AchievementDefinition,
  UserAchievement,
  AchievementProgress,
} from "@skinsense/types";

/** All available achievements */
const ACHIEVEMENTS: AchievementDefinition[] = [
  // Scanning
  { id: "first_scan", name: "First Impression", description: "Complete your first skin scan", icon: "Camera", category: "scanning", requirement: "1 scan", threshold: 1, xpReward: 50 },
  { id: "scans_5", name: "Getting Serious", description: "Complete 5 skin scans", icon: "Layers", category: "scanning", requirement: "5 scans", threshold: 5, xpReward: 100 },
  { id: "scans_10", name: "Dedicated Observer", description: "Complete 10 skin scans", icon: "Eye", category: "scanning", requirement: "10 scans", threshold: 10, xpReward: 200 },
  { id: "scans_25", name: "Skin Scientist", description: "Complete 25 skin scans", icon: "Microscope", category: "scanning", requirement: "25 scans", threshold: 25, xpReward: 500 },

  // Routine
  { id: "routine_3day", name: "Building Habits", description: "Follow your routine for 3 days straight", icon: "Calendar", category: "routine", requirement: "3-day streak", threshold: 3, xpReward: 75 },
  { id: "routine_7day", name: "Weekly Warrior", description: "7-day routine adherence streak", icon: "Flame", category: "routine", requirement: "7-day streak", threshold: 7, xpReward: 150 },
  { id: "routine_30day", name: "Monthly Master", description: "30-day routine adherence streak", icon: "Crown", category: "routine", requirement: "30-day streak", threshold: 30, xpReward: 500 },

  // Lifestyle
  { id: "checkin_first", name: "Self Aware", description: "Log your first lifestyle check-in", icon: "ClipboardCheck", category: "lifestyle", requirement: "1 check-in", threshold: 1, xpReward: 25 },
  { id: "checkin_7day", name: "Mindful Week", description: "Log check-ins for 7 consecutive days", icon: "Heart", category: "lifestyle", requirement: "7-day check-in streak", threshold: 7, xpReward: 100 },
  { id: "checkin_30day", name: "Lifestyle Guru", description: "30-day check-in streak", icon: "Star", category: "lifestyle", requirement: "30-day check-in streak", threshold: 30, xpReward: 400 },
  { id: "hydration_master", name: "Hydration Hero", description: "Drink 8+ glasses of water for 7 days straight", icon: "Droplets", category: "lifestyle", requirement: "7-day hydration streak", threshold: 7, xpReward: 150 },

  // Improvement
  { id: "score_improve_5", name: "Visible Progress", description: "Improve your skin health score by 5+ points", icon: "TrendingUp", category: "improvement", requirement: "+5 score improvement", threshold: 5, xpReward: 100 },
  { id: "score_improve_15", name: "Transformation", description: "Improve your skin health score by 15+ points", icon: "Sparkles", category: "improvement", requirement: "+15 score improvement", threshold: 15, xpReward: 300 },
  { id: "barrier_above_70", name: "Strong Barrier", description: "Reach a barrier health score above 70", icon: "Shield", category: "improvement", requirement: "Barrier score > 70", threshold: 70, xpReward: 200 },

  // Milestones
  { id: "profile_complete", name: "Identity Set", description: "Complete your skin profile questionnaire", icon: "UserCheck", category: "milestones", requirement: "Complete profile", threshold: 1, xpReward: 50 },
  { id: "product_scanned", name: "Product Detective", description: "Scan your first product barcode", icon: "Barcode", category: "milestones", requirement: "Scan 1 product", threshold: 1, xpReward: 50 },
  { id: "twin_unlocked", name: "Skin Twin Found", description: "Unlock your Skin Twin cohort comparison", icon: "Users", category: "social", requirement: "View Skin Twin", threshold: 1, xpReward: 75 },
];

const XP_PER_LEVEL = 250;

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get all achievements and their progress for a user.
   */
  async getProgress(userId: string): Promise<AchievementProgress> {
    const userAchievements = await this.prisma.achievement.findMany({
      where: { userId },
    });

    const achievementMap = new Map(userAchievements.map((a) => [a.achievementId, a]));

    const achievements: UserAchievement[] = ACHIEVEMENTS.map((def) => {
      const ua = achievementMap.get(def.id);
      return {
        achievementId: def.id,
        name: def.name,
        description: def.description,
        icon: def.icon,
        category: def.category,
        unlockedAt: ua?.unlockedAt?.toISOString() ?? "",
        progress: ua?.progress ?? 0,
        isNew: ua?.isNew ?? false,
      };
    });

    const unlocked = achievements.filter((a) => a.progress >= 1);
    const totalXp = unlocked.reduce((sum, a) => {
      const def = ACHIEVEMENTS.find((d) => d.id === a.achievementId);
      return sum + (def?.xpReward ?? 0);
    }, 0);

    const level = Math.max(1, Math.floor(totalXp / XP_PER_LEVEL) + 1);
    const xpToNextLevel = XP_PER_LEVEL - (totalXp % XP_PER_LEVEL);

    const recentUnlocks = unlocked
      .filter((a) => a.isNew)
      .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
      .slice(0, 5);

    return {
      totalXp,
      level,
      xpToNextLevel,
      unlockedCount: unlocked.length,
      totalCount: ACHIEVEMENTS.length,
      achievements,
      recentUnlocks,
    };
  }

  /**
   * Evaluate and update all achievements for a user.
   * Call this after significant events (scan complete, check-in logged, etc.)
   */
  async evaluateAchievements(userId: string): Promise<UserAchievement[]> {
    const newlyUnlocked: UserAchievement[] = [];

    // Gather stats
    const scanCount = await this.prisma.scan.count({
      where: { userId, status: "COMPLETED" },
    });

    const checkInCount = await this.prisma.lifestyleLog.count({
      where: { userId },
    });

    const adherenceLogs = await this.prisma.adherenceLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const scans = await this.prisma.scan.findMany({
      where: { userId, status: "COMPLETED" },
      include: { result: true },
      orderBy: { createdAt: "asc" },
    });

    const lifestyleLogs = await this.prisma.lifestyleLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Compute metrics
    const routineStreak = this.computeAdherenceStreak(adherenceLogs);
    const checkInStreak = this.computeCheckInStreak(lifestyleLogs);
    const hydrationStreak = this.computeHydrationStreak(lifestyleLogs);

    const firstScore = scans[0]?.result?.skinHealthScore ?? 0;
    const latestScore = scans[scans.length - 1]?.result?.skinHealthScore ?? 0;
    const scoreImprovement = latestScore - firstScore;
    const latestBarrier = scans[scans.length - 1]?.result?.barrierScore ?? 0;
    const profileComplete = !!(user?.skinType && user?.fitzpatrick);

    // Evaluate each achievement
    const evaluations: { id: string; progress: number }[] = [
      { id: "first_scan", progress: Math.min(1, scanCount / 1) },
      { id: "scans_5", progress: Math.min(1, scanCount / 5) },
      { id: "scans_10", progress: Math.min(1, scanCount / 10) },
      { id: "scans_25", progress: Math.min(1, scanCount / 25) },
      { id: "routine_3day", progress: Math.min(1, routineStreak / 3) },
      { id: "routine_7day", progress: Math.min(1, routineStreak / 7) },
      { id: "routine_30day", progress: Math.min(1, routineStreak / 30) },
      { id: "checkin_first", progress: Math.min(1, checkInCount / 1) },
      { id: "checkin_7day", progress: Math.min(1, checkInStreak / 7) },
      { id: "checkin_30day", progress: Math.min(1, checkInStreak / 30) },
      { id: "hydration_master", progress: Math.min(1, hydrationStreak / 7) },
      { id: "score_improve_5", progress: Math.min(1, Math.max(0, scoreImprovement) / 5) },
      { id: "score_improve_15", progress: Math.min(1, Math.max(0, scoreImprovement) / 15) },
      { id: "barrier_above_70", progress: latestBarrier >= 70 ? 1 : latestBarrier / 70 },
      { id: "profile_complete", progress: profileComplete ? 1 : 0 },
      { id: "product_scanned", progress: 0 }, // tracked via barcode scan events
      { id: "twin_unlocked", progress: 0 },   // tracked via skin twin view events
    ];

    for (const { id, progress } of evaluations) {
      const existing = await this.prisma.achievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: id } },
      });

      const wasUnlocked = existing?.progress === 1;
      const isNowUnlocked = progress >= 1;

      await this.prisma.achievement.upsert({
        where: { userId_achievementId: { userId, achievementId: id } },
        create: {
          userId,
          achievementId: id,
          progress,
          unlockedAt: isNowUnlocked ? new Date() : null,
          isNew: isNowUnlocked,
        },
        update: {
          progress,
          unlockedAt: isNowUnlocked && !wasUnlocked ? new Date() : existing?.unlockedAt,
          isNew: isNowUnlocked && !wasUnlocked ? true : existing?.isNew ?? false,
        },
      });

      if (isNowUnlocked && !wasUnlocked) {
        const def = ACHIEVEMENTS.find((a) => a.id === id)!;
        newlyUnlocked.push({
          achievementId: id,
          name: def.name,
          description: def.description,
          icon: def.icon,
          category: def.category,
          unlockedAt: new Date().toISOString(),
          progress: 1,
          isNew: true,
        });
      }
    }

    return newlyUnlocked;
  }

  /**
   * Mark achievements as "seen" (no longer new).
   */
  async markSeen(userId: string): Promise<void> {
    await this.prisma.achievement.updateMany({
      where: { userId, isNew: true },
      data: { isNew: false },
    });
  }

  private computeAdherenceStreak(logs: any[]): number {
    if (logs.length === 0) return 0;
    let streak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i]!.amCompleted || logs[i]!.pmCompleted) {
        streak++;
      } else break;
    }
    return streak;
  }

  private computeCheckInStreak(logs: any[]): number {
    if (logs.length === 0) return 0;
    const dates = [...new Set(logs.map((l) => l.date.toISOString().split("T")[0]!))].sort();
    let streak = 1;
    for (let i = dates.length - 1; i > 0; i--) {
      const curr = new Date(dates[i]!).getTime();
      const prev = new Date(dates[i - 1]!).getTime();
      if (curr - prev === 86400000) streak++;
      else break;
    }
    return streak;
  }

  private computeHydrationStreak(logs: any[]): number {
    if (logs.length === 0) return 0;
    let streak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i]!.waterGlasses >= 8) streak++;
      else break;
    }
    return streak;
  }
}
