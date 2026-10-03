import { Injectable, Logger } from "@nestjs/common";
import {
  SmartNotification,
  SmartNotificationPreferences,
  NotificationType,
  WeeklyDigestSummary,
} from "@skinsense/types";

export interface NotificationCandidate {
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  isTimeSensitive?: boolean;
  isActionable?: boolean;
  isPersonalized?: boolean;
  scheduledFor?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class SmartNotificationService {
  private readonly logger = new Logger(SmartNotificationService.name);

  // In-memory queues and preferences
  private readonly userPreferences = new Map<string, SmartNotificationPreferences>();
  private readonly notificationQueue = new Map<string, SmartNotification[]>();

  constructor() {
    // Seed default preferences for demo user
    this.userPreferences.set("user-1", {
      userId: "user-1",
      routineReminders: true,
      weatherAlerts: true,
      encouragement: true,
      restockAlerts: true,
      quietMode: false,
      preferredAmTime: "08:00",
      preferredPmTime: "21:30",
    });
  }

  /**
   * Calculates a contextual priority score (0 - 100)
   */
  calculatePriority(candidate: NotificationCandidate, prefs: SmartNotificationPreferences): number {
    if (prefs.quietMode && candidate.type !== "restock_alert") {
      return 0; // Quiet mode suppresses non-critical alerts
    }

    let baseScore = 40;
    switch (candidate.type) {
      case "weather_alert":
        baseScore = 65;
        if (!prefs.weatherAlerts) return 0;
        break;
      case "routine_reminder":
        baseScore = 55;
        if (!prefs.routineReminders) return 0;
        break;
      case "restock_alert":
        baseScore = 60;
        if (!prefs.restockAlerts) return 0;
        break;
      case "weekly_digest":
        baseScore = 50;
        break;
      case "encouragement":
        baseScore = 35;
        if (!prefs.encouragement) return 0;
        break;
    }

    const timeBonus = candidate.isTimeSensitive ? 20 : 0;
    const actionableBonus = candidate.isActionable ? 15 : 0;
    const personalizedBonus = candidate.isPersonalized ? 10 : 0;

    const total = baseScore + timeBonus + actionableBonus + personalizedBonus;
    return Math.min(100, Math.max(0, total));
  }

  /**
   * Enqueues a notification candidate with priority scoring and daily bundling
   */
  async enqueueNotification(
    userId: string,
    candidate: NotificationCandidate,
  ): Promise<SmartNotification | null> {
    const prefs = await this.getPreferences(userId);
    const priority = this.calculatePriority(candidate, prefs);

    if (priority <= 0) {
      this.logger.debug(`Notification muted by user preferences for user ${userId}`);
      return null;
    }

    const notification: SmartNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: candidate.type,
      priority,
      title: candidate.title,
      body: candidate.body,
      actionUrl: candidate.actionUrl,
      scheduledFor: candidate.scheduledFor ?? new Date().toISOString(),
      sentAt: new Date().toISOString(),
      metadata: candidate.metadata,
    };

    const userList = this.notificationQueue.get(userId) || [];
    userList.push(notification);

    // Apply smart bundling if more than 2 pending today
    const bundled = this.bundleDailyNotifications(userList);
    this.notificationQueue.set(userId, bundled);

    return notification;
  }

  /**
   * Bundles notifications to avoid notification fatigue (max 2 standalone alerts/day)
   */
  public bundleDailyNotifications(notifications: SmartNotification[]): SmartNotification[] {
    const today = new Date().toISOString().slice(0, 10);
    const todayItems = notifications.filter((n) => n.scheduledFor.startsWith(today));
    const otherItems = notifications.filter((n) => !n.scheduledFor.startsWith(today));

    if (todayItems.length <= 2) {
      return notifications;
    }

    // Sort by priority descending
    todayItems.sort((a, b) => b.priority - a.priority);

    // Keep highest priority standalone, bundle remaining into an aggregated notification
    const primary = todayItems[0]!;
    const remaining = todayItems.slice(1);

    const bundledSummary: SmartNotification = {
      id: `bundle-${Date.now()}`,
      userId: primary.userId,
      type: "routine_reminder",
      priority: 75,
      title: "SkinSense Daily Skin Brief",
      body: remaining.map((r) => `• ${r.title}: ${r.body}`).join("\n"),
      actionUrl: "/home",
      scheduledFor: primary.scheduledFor,
      sentAt: new Date().toISOString(),
    };

    return [...otherItems, primary, bundledSummary];
  }

  /**
   * Evaluates external weather conditions for triggers
   */
  async evaluateWeatherTriggers(
    userId: string,
    weather: { uvIndex: number; humidityPercent: number },
  ): Promise<SmartNotification | null> {
    if (weather.uvIndex >= 6) {
      return this.enqueueNotification(userId, {
        type: "weather_alert",
        title: "High UV Index Warning",
        body: `UV index is currently ${weather.uvIndex}. Reapply broad-spectrum SPF 50 every 2 hours outdoors.`,
        actionUrl: "/routine",
        isTimeSensitive: true,
        isActionable: true,
      });
    }

    if (weather.humidityPercent < 30) {
      return this.enqueueNotification(userId, {
        type: "weather_alert",
        title: "Low Ambient Humidity",
        body: `Humidity is down to ${weather.humidityPercent}%. Support your stratum corneum with a ceramide moisturizer.`,
        actionUrl: "/routine",
        isActionable: true,
      });
    }

    return null;
  }

  /**
   * Generates a Sunday 9 AM weekly digest summary
   */
  async generateWeeklyDigest(userId: string): Promise<WeeklyDigestSummary> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      weekStart: weekAgo.toISOString().slice(0, 10),
      weekEnd: now.toISOString().slice(0, 10),
      currentScore: 84,
      scoreDelta: 3,
      adherencePercent: 88,
      completedRoutines: 12,
      targetRoutines: 14,
      topImprovement: "Left cheek microvascular erythema down 14%",
      keyFocusNextWeek: "Maintain strict AM sun protection while retinoid turnover proceeds.",
    };
  }

  /**
   * Retrieves active notifications for a user
   */
  async getNotifications(userId: string): Promise<SmartNotification[]> {
    return this.notificationQueue.get(userId) || [];
  }

  /**
   * Marks a notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const list = this.notificationQueue.get(userId) || [];
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.readAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * User preferences CRUD
   */
  async getPreferences(userId: string): Promise<SmartNotificationPreferences> {
    return (
      this.userPreferences.get(userId) || {
        userId,
        routineReminders: true,
        weatherAlerts: true,
        encouragement: true,
        restockAlerts: true,
        quietMode: false,
        preferredAmTime: "08:00",
        preferredPmTime: "21:30",
      }
    );
  }

  async updatePreferences(
    userId: string,
    updates: Partial<SmartNotificationPreferences>,
  ): Promise<SmartNotificationPreferences> {
    const current = await this.getPreferences(userId);
    const updated: SmartNotificationPreferences = { ...current, ...updates };
    this.userPreferences.set(userId, updated);
    return updated;
  }
}
