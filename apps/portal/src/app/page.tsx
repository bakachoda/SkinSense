"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Shield, ArrowRight, Lock, Clock } from "lucide-react";

export default function PortalHomePage() {
  const router = useRouter();
  const [token, setToken] = useState("");

  const handleOpenPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    router.push(`/patient/${encodeURIComponent(token.trim())}`);
  };

  const openDemoPatient = () => {
    router.push("/patient/demo_patient_token");
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "#161E2E",
          border: "1px solid #1F2937",
          borderRadius: "20px",
          padding: "36px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "rgba(2, 132, 199, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stethoscope size={24} color="#38BDF8" />
          </div>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#F8FAFC" }}>
              SkinSense Provider Portal
            </h1>
            <p style={{ fontSize: "13px", color: "#94A3B8", margin: "4px 0 0 0" }}>
              Zero-Friction Clinical Intake & Telemetry
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            borderRadius: "12px",
            padding: "12px",
            marginBottom: "24px",
          }}
        >
          <Shield size={18} color="#10B981" style={{ marginTop: "2px", flexShrink: 0 }} />
          <p style={{ fontSize: "12px", color: "#A7F3D0", margin: 0, lineHeight: "17px" }}>
            Patient-directed data sharing. No account or password creation required. Links expire in 90 days with view-only permissions.
          </p>
        </div>

        <form onSubmit={handleOpenPatient}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#94A3B8",
              marginBottom: "8px",
              letterSpacing: "0.5px",
            }}
          >
            ENTER PATIENT INVITE TOKEN OR URL
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="e.g. portal_9f82a17b4c9e"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: "#0B0F19",
                border: "1px solid #334155",
                borderRadius: "10px",
                padding: "12px 14px",
                color: "#F8FAFC",
                fontSize: "14px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#0284C7",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "0 18px",
                fontWeight: "600",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              Open <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button
            onClick={openDemoPatient}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "#38BDF8",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Open Sample Patient Record (Dr. Preview) →
          </button>
        </div>
      </div>
    </main>
  );
}
