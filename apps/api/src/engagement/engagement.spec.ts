import { ClinicalReportService } from "./clinical-report.service";
import { SmartNotificationService } from "./smart-notification.service";
import { SkinDiaryService } from "./skin-diary.service";
import { RoutineCardService } from "./routine-card.service";

describe("Phase 10: Engagement & Visual Intelligence Suite", () => {
  describe("ClinicalReportService", () => {
    let service: ClinicalReportService;

    beforeEach(() => {
      service = new ClinicalReportService();
    });

    it("should compute composite health score and delta correctly", async () => {
      const report = await service.generateReport({
        scanId: "scan-test-1",
        userId: "user-1",
        previousOverallScore: 75,
        hydration: 80,
        barrierHealth: 80,
        oilBalance: 70,
        inflammation: 70,
        pigmentation: 75,
        texture: 75,
        microbiome: 75,
      });

      expect(report.overallScore).toBeGreaterThanOrEqual(70);
      expect(report.overallScore).toBeLessThanOrEqual(85);
      expect(report.scoreDelta).toBe(report.overallScore - 75);
      expect(report.scoreBreakdown.hydration).toBe(80);
      expect(report.scoreBreakdown.barrierHealth).toBe(80);
      expect(report.summary).toContain(report.overallScore.toString());
    });

    it("should extract zone-specific findings into clinical concerns", async () => {
      const report = await service.generateReport({
        scanId: "scan-test-2",
        userId: "user-1",
        zoneScores: {
          forehead: { oiliness: 72 },
          left_cheek: { erythema: 60 },
          periorbital: { dehydration: 50 },
        },
      });

      expect(report.keyConcerns.length).toBeGreaterThanOrEqual(3);
      const foreheadConcern = report.keyConcerns.find((c) => c.zone === "Forehead");
      expect(foreheadConcern).toBeDefined();
      expect(foreheadConcern?.concern).toBe("Sebaceous Hyperactivity");
      expect(foreheadConcern?.targetedByProducts).toContain("Niacinamide 10% + Zinc 1%");

      const cheekConcern = report.keyConcerns.find((c) => c.zone === "Left Cheek");
      expect(cheekConcern).toBeDefined();
      expect(cheekConcern?.targetedByProducts).toContain("Azelaic Acid 10% Suspension");
    });

    it("should provide 12-week phased milestones and evidentiary citations", async () => {
      const report = await service.generateReport({
        scanId: "scan-test-3",
        userId: "user-1",
      });

      expect(report.phasedPlan.length).toBe(3);
      expect(report.phasedPlan[0]!.week).toBe(2);
      expect(report.phasedPlan[1]!.week).toBe(6);
      expect(report.phasedPlan[2]!.week).toBe(12);

      expect(report.confidenceNotes.length).toBe(3);
      expect(report.confidenceNotes[0]!.confidenceScore).toBeGreaterThanOrEqual(0.85);
    });

    it("should generate a 60-second audio summary script", async () => {
      const report = await service.generateReport({
        scanId: "scan-test-4",
        userId: "user-1",
      });

      expect(report.audioSummaryScript).toBeDefined();
      expect(report.audioSummaryScript).toContain("skin health score");
    });

    it("should verify narrative integrity against authoritative ground truth", () => {
      const faithfulText = "Your skin health score is 82. Hydration is 78 and barrier is 85.";
      const passResult = service.verifyReportIntegrity(faithfulText, 82, 78, 85);
      expect(passResult.verificationPassed).toBe(true);
      expect(passResult.flags.length).toBe(0);

      const hallucinatedText = "Your skin health score is 99. Hydration is 12 and barrier is 0.";
      const failResult = service.verifyReportIntegrity(hallucinatedText, 82, 78, 85);
      expect(failResult.verificationPassed).toBe(false);
      expect(failResult.flags.length).toBeGreaterThan(0);
    });
  });

  describe("SmartNotificationService", () => {
    let service: SmartNotificationService;

    beforeEach(() => {
      service = new SmartNotificationService();
    });

    it("should calculate priority scores with bonuses", () => {
      const prefs = {
        userId: "u1",
        routineReminders: true,
        weatherAlerts: true,
        encouragement: true,
        restockAlerts: true,
        quietMode: false,
        preferredAmTime: "08:00",
        preferredPmTime: "21:30",
      };

      const highUrgency = service.calculatePriority(
        {
          type: "weather_alert",
          title: "UV 9",
          body: "Dangerous UV",
          isTimeSensitive: true,
          isActionable: true,
        },
        prefs,
      );

      // base 65 + 20 time + 15 actionable = 100
      expect(highUrgency).toBe(100);

      const regularReminder = service.calculatePriority(
        {
          type: "routine_reminder",
          title: "PM Routine",
          body: "Time for wash",
          isTimeSensitive: false,
        },
        prefs,
      );
      expect(regularReminder).toBe(55);
    });

    it("should suppress non-critical notifications in quiet mode", () => {
      const quietPrefs = {
        userId: "u1",
        routineReminders: true,
        weatherAlerts: true,
        encouragement: true,
        restockAlerts: true,
        quietMode: true,
        preferredAmTime: "08:00",
        preferredPmTime: "21:30",
      };

      const score = service.calculatePriority(
        {
          type: "routine_reminder",
          title: "Routine",
          body: "Reminder",
        },
        quietPrefs,
      );
      expect(score).toBe(0);

      // Restock alerts bypass quiet mode
      const restockScore = service.calculatePriority(
        {
          type: "restock_alert",
          title: "Restock",
          body: "Bottle empty soon",
        },
        quietPrefs,
      );
      expect(restockScore).toBeGreaterThan(0);
    });

    it("should trigger weather alerts on high UV or low humidity", async () => {
      const uvAlert = await service.evaluateWeatherTriggers("user-1", {
        uvIndex: 8,
        humidityPercent: 55,
      });
      expect(uvAlert).not.toBeNull();
      expect(uvAlert?.title).toContain("High UV");

      const dryAlert = await service.evaluateWeatherTriggers("user-1", {
        uvIndex: 2,
        humidityPercent: 20,
      });
      expect(dryAlert).not.toBeNull();
      expect(dryAlert?.title).toContain("Low Ambient Humidity");
    });

    it("should bundle notifications when more than 2 occur on the same day", () => {
      const today = new Date().toISOString();
      const list = [
        { id: "1", userId: "u1", type: "weather_alert" as const, priority: 90, title: "UV Alert", body: "Wear SPF", scheduledFor: today },
        { id: "2", userId: "u1", type: "routine_reminder" as const, priority: 60, title: "AM Cleanse", body: "Wash face", scheduledFor: today },
        { id: "3", userId: "u1", type: "encouragement" as const, priority: 40, title: "Great streak", body: "5 days strong", scheduledFor: today },
      ];

      const bundled = service.bundleDailyNotifications(list);
      expect(bundled.length).toBe(2);
      expect(bundled[0]!.id).toBe("1"); // highest priority
      expect(bundled[1]!.title).toContain("Daily Skin Brief");
    });

    it("should generate Sunday weekly digest summary", async () => {
      const digest = await service.generateWeeklyDigest("user-1");
      expect(digest.currentScore).toBe(84);
      expect(digest.scoreDelta).toBe(3);
      expect(digest.adherencePercent).toBeGreaterThanOrEqual(80);
      expect(digest.topImprovement).toBeDefined();
    });
  });

  describe("SkinDiaryService", () => {
    let service: SkinDiaryService;

    beforeEach(() => {
      service = new SkinDiaryService();
    });

    it("should create and retrieve diary entries with tags and micro-prompt answers", async () => {
      const entry = await service.createEntry("user-1", {
        note: "Skin feels calmer after applying Centella gel.",
        tags: ["calming", "centella"],
        photos: [],
        promptedAnswers: {
          skinFeel: 50,
          irritation: false,
        },
      });

      expect(entry.id).toBeDefined();
      expect(entry.tags).toContain("calming");
      expect(entry.promptedAnswers?.skinFeel).toBe(50);

      const entries = await service.getEntries("user-1");
      expect(entries.length).toBeGreaterThanOrEqual(3);
      expect(entries[0]!.note).toBe("Skin feels calmer after applying Centella gel.");
    });

    it("should add and retrieve timeline markers", async () => {
      const marker = await service.addMarker("user-1", {
        label: "Switched to Barrier Cream",
        type: "product",
      });

      expect(marker.label).toBe("Switched to Barrier Cream");
      const markers = await service.getMarkers("user-1");
      expect(markers.some((m) => m.label === "Switched to Barrier Cream")).toBe(true);
    });
  });

  describe("RoutineCardService", () => {
    let service: RoutineCardService;

    beforeEach(() => {
      service = new RoutineCardService();
    });

    it("should generate structured AM/PM routine card with wait times", async () => {
      const card = await service.generateRoutineCard("Jordan");
      expect(card.userName).toBe("Jordan");
      expect(card.amSteps.length).toBe(5);
      expect(card.pmSteps.length).toBe(4);
      expect(card.weeklyChecklistDays.length).toBe(7);
      expect(card.verificationQrPayload).toContain("skinsense://routine/card-verify");
    });

    it("should render printable HTML template", async () => {
      const card = await service.generateRoutineCard("Jordan");
      const html = await service.renderHtmlCard(card);
      expect(html).toContain("SKINSENSE CLINICAL ROUTINE");
      expect(html).toContain("Morning Protocol (AM)");
      expect(html).toContain("Evening Protocol (PM)");
      expect(html).toContain("tracker-table");
    });
  });
});
