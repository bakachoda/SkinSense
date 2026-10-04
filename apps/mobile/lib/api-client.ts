import { io, Socket } from "socket.io-client";
import type {
  CreateScanResponse,
  PresignedUploadResponse,
  ScanResult,
  Routine,
  Questionnaire,
  ProductCard,
  CreateAdherenceLog,
  CreateScanRequest,
  CreateSelfAssessment,
  SelfAssessment,
} from "@skinsense/types";
import { useAuthStore } from "../stores/auth";
import Constants from "expo-constants";

function resolveHostUrl(envUrl: string | undefined, defaultPath: string): string {
  if (envUrl && !envUrl.includes("127.0.0.1") && !envUrl.includes("localhost")) {
    return envUrl;
  }
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(":")[0];
    return `http://${hostIp}:3000${defaultPath}`;
  }
  return envUrl || `http://127.0.0.1:3000${defaultPath}`;
}

export const API_BASE_URL = resolveHostUrl(process.env["EXPO_PUBLIC_API_URL"], "/api");
export const SOCKET_BASE_URL = resolveHostUrl(process.env["EXPO_PUBLIC_SOCKET_URL"], "");

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken || "mock-dev-token";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errMsg = `Request failed: ${res.status}`;
    try {
      const errJson = await res.json();
      errMsg = errJson.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  async presignUpload(contentType = "image/jpeg", fileSize = 1024 * 1024): Promise<PresignedUploadResponse> {
    return request<PresignedUploadResponse>("/upload/presign", {
      method: "POST",
      body: JSON.stringify({ contentType, fileSize }),
    });
  },

  async createScan(
    payloadOrKey: string | CreateScanRequest,
    questionnaire?: Questionnaire,
  ): Promise<CreateScanResponse> {
    const body =
      typeof payloadOrKey === "string"
        ? { imageKey: payloadOrKey, questionnaire }
        : payloadOrKey;

    return request<CreateScanResponse>("/scans", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  async submitSelfAssessment(
    scanId: string,
    data: CreateSelfAssessment,
  ): Promise<{ selfAssessment: SelfAssessment; findings?: any }> {
    return request<{ selfAssessment: SelfAssessment; findings?: any }>(
      `/scans/${scanId}/self-assessment`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async getScan(id: string): Promise<{ scan: any; result?: ScanResult; selfAssessment?: SelfAssessment }> {
    return request<{ scan: any; result?: ScanResult; selfAssessment?: SelfAssessment }>(`/scans/${id}`);
  },

  async getScanResult(scanId: string): Promise<{ result: ScanResult; selfAssessment?: SelfAssessment }> {
    return request<{ result: ScanResult; selfAssessment?: SelfAssessment }>(`/scans/${scanId}/result`);
  },

  async getScans(): Promise<{ scans: any[]; total: number }> {
    return request<{ scans: any[]; total: number }>("/scans");
  },

  async getLatestRoutine(): Promise<{ routine: Routine }> {
    return request<{ routine: Routine }>("/routines/latest");
  },

  async getProducts(params?: Record<string, string | number>): Promise<{ products: ProductCard[]; total: number }> {
    const qs = params
      ? "?" +
        Object.entries(params)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      : "";
    return request<{ products: ProductCard[]; total: number }>(`/products${qs}`);
  },

  async logAdherence(log: CreateAdherenceLog): Promise<{ log: any }> {
    return request<{ log: any }>("/adherence", {
      method: "POST",
      body: JSON.stringify(log),
    });
  },

  async getAdherence(from?: string, to?: string): Promise<{ logs: any[] }> {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request<{ logs: any[] }>(`/adherence${qs}`);
  },

  async updateProfile(profile: Partial<Questionnaire>): Promise<{ user: any }> {
    return request<{ user: any }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(profile),
    });
  },

  async acknowledgeDisclaimer(version = 1): Promise<{ acknowledged: boolean }> {
    return request<{ acknowledged: boolean }>("/profile/disclaimer", {
      method: "POST",
      body: JSON.stringify({ version }),
    });
  },

  async updateNotifications(prefs: {
    amReminderEnabled?: boolean;
    pmReminderEnabled?: boolean;
    scanReminderEnabled?: boolean;
  }): Promise<{ user: any }> {
    return request<{ user: any }>("/profile/notifications", {
      method: "PATCH",
      body: JSON.stringify(prefs),
    });
  },

  async exportUserData(): Promise<{ export: any }> {
    return request<{ export: any }>("/profile/export", {
      method: "POST",
    });
  },

  async deleteUserData(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/profile/data", {
      method: "DELETE",
    });
  },

  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/profile/account", {
      method: "DELETE",
    });
  },

  async submitFeedback(data: {
    type: "feedback" | "bug";
    content: string;
    screenshotUrl?: string;
    appVersion?: string;
    osVersion?: string;
    deviceModel?: string;
    logs?: string;
  }): Promise<{ feedback: any; success: boolean }> {
    return request<{ feedback: any; success: boolean }>("/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async calibrateHardware(profileData: any): Promise<{ profile: any; adaptiveThresholds: any }> {
    return request<{ profile: any; adaptiveThresholds: any }>("/hardware/device-profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  },

  async getDeviceHardwareProfile(deviceId: string): Promise<{ profile: any; adaptiveThresholds: any }> {
    return request<{ profile: any; adaptiveThresholds: any }>(`/hardware/device-profile/${deviceId}`);
  },

  async auditCapabilities(caps: any): Promise<any> {
    return request<any>("/hardware/capabilities-audit", {
      method: "POST",
      body: JSON.stringify(caps),
    });
  },

  async getHardwareSampleAnalysis(mode = "lidar"): Promise<any> {
    return request<any>(`/hardware/sample-analysis?mode=${mode}`);
  },

  async createPredictions(input: any): Promise<any> {
    return request<any>("/hardware/predictions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async getUserPredictions(userId: string): Promise<any[]> {
    return request<any[]>(`/hardware/predictions/user/${userId}`);
  },

  // ── Phase 6: Longitudinal Intelligence ──

  async getTimeline(userId: string, window: string = "30d"): Promise<any> {
    return request<any>(`/longitudinal/timeline?userId=${userId}&window=${window}`);
  },

  async getSkinTwin(userId: string): Promise<any> {
    return request<any>(`/longitudinal/skin-twin?userId=${userId}`);
  },

  async logLifestyleCheckIn(userId: string, data: any): Promise<any> {
    return request<any>(`/longitudinal/lifestyle/check-in?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getLifestyleCheckIns(userId: string, days = 30): Promise<any> {
    return request<any>(`/longitudinal/lifestyle/check-ins?userId=${userId}&days=${days}`);
  },

  async getLifestyleInsights(userId: string): Promise<any> {
    return request<any>(`/longitudinal/lifestyle/insights?userId=${userId}`);
  },

  async getAchievements(userId: string): Promise<any> {
    return request<any>(`/longitudinal/achievements?userId=${userId}`);
  },

  async evaluateAchievements(userId: string): Promise<any> {
    return request<any>(`/longitudinal/achievements/evaluate?userId=${userId}`, {
      method: "POST",
    });
  },

  async markAchievementsSeen(userId: string): Promise<any> {
    return request<any>(`/longitudinal/achievements/mark-seen?userId=${userId}`, {
      method: "POST",
    });
  },

  // ── Phase 10: Engagement & Visual Intelligence ──

  async generateClinicalReport(scanData: any): Promise<any> {
    return request<any>("/engagement/reports/generate", {
      method: "POST",
      body: JSON.stringify(scanData),
    });
  },

  async getClinicalReport(scanId: string): Promise<any> {
    return request<any>(`/engagement/reports/${scanId}`);
  },

  async getSmartNotifications(): Promise<any[]> {
    return request<any[]>("/engagement/notifications");
  },

  async updateNotificationPreferences(prefs: any): Promise<any> {
    return request<any>("/engagement/notifications/preferences", {
      method: "POST",
      body: JSON.stringify(prefs),
    });
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/engagement/notifications/${id}/read`, {
      method: "POST",
    });
  },

  async getSkinDiary(): Promise<any[]> {
    return request<any[]>("/engagement/diary");
  },

  async createDiaryEntry(entry: any): Promise<any> {
    return request<any>("/engagement/diary", {
      method: "POST",
      body: JSON.stringify(entry),
    });
  },

  async getRoutineCard(userName = "Alex"): Promise<any> {
    return request<any>(`/engagement/routine-card?name=${encodeURIComponent(userName)}`);
  },

  // ── Phase 11: Monetization & Entitlements ──

  async getSubscriptionPlans(): Promise<any[]> {
    return request<any[]>("/monetization/plans");
  },

  async getUserEntitlements(): Promise<any> {
    return request<any>("/monetization/entitlements");
  },

  async upgradeSubscription(tier: string, provider = "SANDBOX_TEST"): Promise<any> {
    return request<any>("/monetization/upgrade", {
      method: "POST",
      body: JSON.stringify({ tier, provider }),
    });
  },

  async restorePurchases(): Promise<any> {
    return request<any>("/monetization/restore", {
      method: "POST",
    });
  },

  async cancelSubscription(): Promise<any> {
    return request<any>("/monetization/cancel", {
      method: "POST",
    });
  },

  // ── Phase 13: Offline Sync & Resilience ──

  async batchSyncOfflineItems(items: any[]): Promise<any> {
    return request<any>("/sync/batch", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  },

  createScanSocket(scanId: string): Socket {
    const socket = io(SOCKET_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      socket.emit("subscribe", { scanId });
    });

    return socket;
  },
};

