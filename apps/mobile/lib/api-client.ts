import { io, Socket } from "socket.io-client";
import type {
  CreateScanResponse,
  PresignedUploadResponse,
  ScanResult,
  Routine,
  Questionnaire,
  ProductCard,
  CreateAdherenceLog,
} from "@skinsense/types";
import { useAuthStore } from "../stores/auth";

export const API_BASE_URL =
  process.env["EXPO_PUBLIC_API_URL"] || "http://127.0.0.1:3000/api";
export const SOCKET_BASE_URL =
  process.env["EXPO_PUBLIC_SOCKET_URL"] || "http://127.0.0.1:3000";

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

  async createScan(imageKey: string, questionnaire: Questionnaire): Promise<CreateScanResponse> {
    return request<CreateScanResponse>("/scans", {
      method: "POST",
      body: JSON.stringify({ imageKey, questionnaire }),
    });
  },

  async getScan(id: string): Promise<{ scan: any; result?: ScanResult }> {
    return request<{ scan: any; result?: ScanResult }>(`/scans/${id}`);
  },

  async getScanResult(scanId: string): Promise<{ result: ScanResult }> {
    return request<{ result: ScanResult }>(`/scans/${scanId}/result`);
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
