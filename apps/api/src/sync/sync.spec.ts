import { Test, TestingModule } from "@nestjs/testing";
import { SyncService } from "./sync.service";
import { PrismaService } from "../prisma/prisma.service";

describe("Phase 13: Offline Sync & Resilience Engine", () => {
  let service: SyncService;
  let prisma: PrismaService;

  const mockUser = {
    id: "test-user-sync",
    supabaseId: "mock-sub-sync",
    email: "sync@skinsense.ai",
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncService, PrismaService],
    }).compile();

    service = module.get<SyncService>(SyncService);
    prisma = module.get<PrismaService>(PrismaService);

    // Upsert test user
    await prisma.user.upsert({
      where: { supabaseId: mockUser.supabaseId },
      create: mockUser,
      update: {},
    });
  });

  afterAll(async () => {
    await prisma.lifestyleLog.deleteMany({ where: { userId: mockUser.id } });
    await prisma.adherenceLog.deleteMany({ where: { userId: mockUser.id } });
    await prisma.user.deleteMany({ where: { id: mockUser.id } });
    await prisma.$disconnect();
  });

  it("should process batch offline diary entries and routine step logs", async () => {
    const response = await service.processBatchSync(mockUser.id, {
      userId: mockUser.id,
      items: [
        {
          id: "queue_diary_1",
          type: "DIARY_ENTRY",
          createdAt: new Date().toISOString(),
          retryCount: 0,
          status: "QUEUED",
          payload: {
            date: new Date().toISOString(),
            skinFeel: "BALANCED",
            activeIrritation: false,
            symptoms: ["Good Hydration"],
            notes: "Offline check-in logged during travel",
          },
        },
        {
          id: "queue_routine_1",
          type: "ROUTINE_STEP_TOGGLE",
          createdAt: new Date().toISOString(),
          retryCount: 0,
          status: "QUEUED",
          payload: {
            period: "AM",
            completed: true,
          },
        },
        {
          id: "queue_scan_1",
          type: "SCAN_CACHE",
          createdAt: new Date().toISOString(),
          retryCount: 0,
          status: "QUEUED",
          payload: {
            cachedScanId: "scan_local_123",
          },
        },
      ],
    });

    expect(response.success).toBe(true);
    expect(response.syncedCount).toBe(3);
    expect(response.failedCount).toBe(0);
    expect(response.syncedIds).toEqual([
      "queue_diary_1",
      "queue_routine_1",
      "queue_scan_1",
    ]);

    // Verify database entry
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await prisma.lifestyleLog.findUnique({
      where: {
        userId_date: {
          userId: mockUser.id,
          date: today,
        },
      },
    });

    expect(log).not.toBeNull();
    expect(log?.notes).toContain("Offline check-in logged during travel");
  });
});
