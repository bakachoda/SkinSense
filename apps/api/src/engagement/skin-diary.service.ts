import { Injectable } from "@nestjs/common";
import { SkinDiaryEntry, TimelineMarker, CreateDiaryEntryInput } from "@skinsense/types";

@Injectable()
export class SkinDiaryService {
  private readonly diaryStore = new Map<string, SkinDiaryEntry[]>();
  private readonly markerStore = new Map<string, TimelineMarker[]>();

  constructor() {
    // Seed sample diary entries and markers for user-1
    this.diaryStore.set("user-1", [
      {
        id: "diary-1",
        userId: "user-1",
        scanId: "scan-sample-1",
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        note: "Cheeks felt slightly tight after morning wash. Switched to gentle cream cleanser.",
        tags: ["tightness", "switchedCleanser"],
        photos: [],
        promptedAnswers: {
          skinFeel: 30, // dry
          irritation: false,
        },
      },
      {
        id: "diary-2",
        userId: "user-1",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        note: "High work stress this week + stayed up late. Noticed slight redness recurrence on left cheek.",
        tags: ["stress", "poorSleep"],
        photos: [],
        promptedAnswers: {
          skinFeel: 45,
          irritation: true,
        },
      },
    ]);

    this.markerStore.set("user-1", [
      {
        id: "marker-1",
        userId: "user-1",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        label: "Initiated Azelaic Acid 10% Protocol",
        type: "product",
      },
      {
        id: "marker-2",
        userId: "user-1",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        label: "Traveled to arid mountain region",
        type: "lifestyle",
      },
    ]);
  }

  /**
   * Adds a new skin diary entry
   */
  async createEntry(userId: string, input: CreateDiaryEntryInput): Promise<SkinDiaryEntry> {
    const entry: SkinDiaryEntry = {
      id: `diary-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      scanId: input.scanId,
      createdAt: new Date().toISOString(),
      note: input.note,
      tags: input.tags ?? [],
      photos: input.photos ?? [],
      promptedAnswers: input.promptedAnswers,
    };

    const entries = this.diaryStore.get(userId) || [];
    entries.unshift(entry);
    this.diaryStore.set(userId, entries);
    return entry;
  }

  /**
   * Retrieves all diary entries for a user in reverse chronological order
   */
  async getEntries(userId: string): Promise<SkinDiaryEntry[]> {
    return this.diaryStore.get(userId) || [];
  }

  /**
   * Adds a timeline event marker
   */
  async addMarker(
    userId: string,
    markerInput: { label: string; type: "product" | "lifestyle" | "medical" },
  ): Promise<TimelineMarker> {
    const marker: TimelineMarker = {
      id: `marker-${Date.now()}`,
      userId,
      createdAt: new Date().toISOString(),
      label: markerInput.label,
      type: markerInput.type,
    };

    const markers = this.markerStore.get(userId) || [];
    markers.push(marker);
    this.markerStore.set(userId, markers);
    return marker;
  }

  /**
   * Retrieves timeline markers for a user
   */
  async getMarkers(userId: string): Promise<TimelineMarker[]> {
    return this.markerStore.get(userId) || [];
  }
}
