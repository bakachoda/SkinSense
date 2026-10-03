"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Download,
  Send,
  Camera,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export default function PatientDashboardPage({
  params,
}: {
  params: { token: string };
}) {
  const [activeTab, setActiveTab] = useState<"summary" | "routine" | "findings" | "notes">("summary");
  const [doctorNote, setDoctorNote] = useState("");
  const [notesList, setNotesList] = useState([
    {
      id: "note-init",
      date: "Oct 1, 2026",
      clinician: "Dr. Elena Rostova, FAAD",
      message: "Patient presents with persistent centrofacial erythema and mild follicular papules on chin. Recommended azelaic acid 15% and ceramide barrier support. Monitored for retinoid tolerance.",
    },
  ]);
  const [photoRequested, setPhotoRequested] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  const patient = {
    id: "PT-8842",
    displayName: "Patient #8842 (Jane D.)",
    age: 28,
    fitzpatrick: 4,
    skinType: "COMBINATION (Dehydrated)",
    barrierScore: 68,
    skinAge: 27,
    scansCount: 8,
    gagsScore: 16,
    igaGrade: 2,
    latestScanDate: "Oct 1, 2026",
    currentMedications: ["Tretinoin 0.05% Cream (Rx)", "Cetirizine 10mg (Seasonal)"],
  };

  const findings = [
    { zone: "Forehead", condition: "Comedonal & inflammatory papules", icd10: "L70.0", severity: 55 },
    { zone: "Left Cheek", condition: "Persistent centrofacial erythema", icd10: "L71.9", severity: 48 },
    { zone: "Right Cheek", condition: "Bilateral epidermal melasma", icd10: "L81.1", severity: 42 },
    { zone: "Chin", condition: "Hormonal inflammatory pustules", icd10: "L70.0", severity: 52 },
  ];

  const amRoutine = [
    { step: 1, category: "CLEANSER", name: "CeraVe Hydrating Cleanser", ingredients: ["Ceramides", "Hyaluronic Acid", "Glycerin"] },
    { step: 2, category: "TREATMENT", name: "Azelaic Acid Suspension 10%", ingredients: ["Azelaic Acid", "Dimethicone"] },
    { step: 3, category: "SPF", name: "La Roche-Posay Anthelios Mineral SPF 50", ingredients: ["Zinc Oxide", "Titanium Dioxide"] },
  ];

  const pmRoutine = [
    { step: 1, category: "CLEANSER", name: "CeraVe Hydrating Cleanser", ingredients: ["Ceramides", "Hyaluronic Acid"] },
    { step: 2, category: "RX ACTIVE", name: "Tretinoin 0.05% Cream (Prescription)", ingredients: ["Tretinoin", "Stearic Acid"] },
    { step: 3, category: "MOISTURIZER", name: "Avene Cicalfate+ Restorative Cream", ingredients: ["Copper-Zinc Sulfate", "Thermal Water"] },
  ];

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorNote.trim()) return;
    setSendingNote(true);
    setTimeout(() => {
      setNotesList((prev) => [
        {
          id: `note-${Date.now()}`,
          date: "Just now",
          clinician: "Consulting Dermatologist",
          message: doctorNote.trim(),
        },
        ...prev,
      ]);
      setDoctorNote("");
      setSendingNote(false);
      alert("Note sent successfully to the patient's mobile app.");
    }, 600);
  };

  const handleRequestPhoto = () => {
    setPhotoRequested(true);
    alert("Photo request prompt dispatched to patient's mobile device for high-res close-up of left cheek.");
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 20px" }}>
      {/* Top Banner */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#161E2E",
          border: "1px solid #1F2937",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              backgroundColor: "rgba(2, 132, 199, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stethoscope size={24} color="#38BDF8" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "18px", fontWeight: "700", margin: 0, color: "#F8FAFC" }}>
                {patient.displayName}
              </h1>
              <span
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.15)",
                  color: "#34D399",
                  fontSize: "11px",
                  fontWeight: "700",
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                TOKEN ACCESS VERIFIED
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: "4px 0 0 0" }}>
              Patient ID: {patient.id} • Last Scan: {patient.latestScanDate} • Total Telemetry Scans: {patient.scansCount}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleRequestPhoto}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: photoRequested ? "rgba(16, 185, 129, 0.2)" : "#1E293B",
              color: photoRequested ? "#34D399" : "#E2E8F0",
              border: "1px solid #334155",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <Camera size={16} />
            {photoRequested ? "Photo Requested" : "Request Close-Up"}
          </button>

          <button
            onClick={handleDownloadPdf}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#0284C7",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            <Download size={16} />
            Export Clinical PDF
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #1F2937",
          paddingBottom: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { key: "summary", label: "Patient Summary" },
          { key: "findings", label: "ICD-10 Findings" },
          { key: "routine", label: "Regimen & INCI" },
          { key: "notes", label: `Clinician Notes (${notesList.length})` },
        ].map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                backgroundColor: isSelected ? "rgba(2, 132, 199, 0.15)" : "transparent",
                color: isSelected ? "#38BDF8" : "#94A3B8",
                border: isSelected ? "1px solid rgba(2, 132, 199, 0.4)" : "1px solid transparent",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab 1: Summary */}
      {activeTab === "summary" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          <div style={{ backgroundColor: "#161E2E", padding: "18px", borderRadius: "14px", border: "1px solid #1F2937" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.5px" }}>PHOTOTYPE</span>
            <h3 style={{ fontSize: "22px", margin: "6px 0 0 0", color: "#F8FAFC" }}>Fitzpatrick IV</h3>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>High PIH / melasma risk</p>
          </div>

          <div style={{ backgroundColor: "#161E2E", padding: "18px", borderRadius: "14px", border: "1px solid #1F2937" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.5px" }}>STRATUM CORNEUM</span>
            <h3 style={{ fontSize: "22px", margin: "6px 0 0 0", color: "#10B981" }}>68 / 100</h3>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Healthy Barrier</p>
          </div>

          <div style={{ backgroundColor: "#161E2E", padding: "18px", borderRadius: "14px", border: "1px solid #1F2937" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.5px" }}>GAGS SCORE</span>
            <h3 style={{ fontSize: "22px", margin: "6px 0 0 0", color: "#F8FAFC" }}>{patient.gagsScore}</h3>
            <p style={{ fontSize: "11px", color: "#38BDF8", margin: "4px 0 0 0" }}>Mild Acne Vulgaris</p>
          </div>

          <div style={{ backgroundColor: "#161E2E", padding: "18px", borderRadius: "14px", border: "1px solid #1F2937" }}>
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.5px" }}>IGA ASSESSMENT</span>
            <h3 style={{ fontSize: "22px", margin: "6px 0 0 0", color: "#F8FAFC" }}>Grade {patient.igaGrade}</h3>
            <p style={{ fontSize: "11px", color: "#94A3B8", margin: "4px 0 0 0" }}>Investigator Scale</p>
          </div>
        </div>
      )}

      {/* Tab 2: Findings */}
      {activeTab === "findings" && (
        <div style={{ backgroundColor: "#161E2E", borderRadius: "16px", border: "1px solid #1F2937", padding: "20px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 16px 0", color: "#F8FAFC" }}>
            Computer Vision Phenotypic Findings & ICD-10 Classification
          </h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #334155", textAlign: "left", color: "#94A3B8" }}>
                <th style={{ padding: "10px 8px" }}>Zone</th>
                <th style={{ padding: "10px 8px" }}>Morphological Finding</th>
                <th style={{ padding: "10px 8px" }}>ICD-10 Code</th>
                <th style={{ padding: "10px 8px", textAlign: "right" }}>AI Severity</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1F2937" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "700", color: "#38BDF8" }}>{f.zone}</td>
                  <td style={{ padding: "12px 8px", color: "#E2E8F0" }}>{f.condition}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span
                      style={{
                        backgroundColor: "rgba(2, 132, 199, 0.15)",
                        color: "#38BDF8",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontWeight: "700",
                      }}
                    >
                      {f.icd10}
                    </span>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", color: "#F8FAFC", fontWeight: "600" }}>
                    {f.severity}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Routine */}
      {activeTab === "routine" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ backgroundColor: "#161E2E", borderRadius: "16px", border: "1px solid #1F2937", padding: "20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 14px 0", color: "#38BDF8" }}>
              AM MORNING REGIMEN
            </h2>
            {amRoutine.map((step) => (
              <div key={step.step} style={{ backgroundColor: "#0B0F19", padding: "12px", borderRadius: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>STEP {step.step} • {step.category}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#F8FAFC", marginTop: "3px" }}>{step.name}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>INCI: {step.ingredients.join(", ")}</div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#161E2E", borderRadius: "16px", border: "1px solid #1F2937", padding: "20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 14px 0", color: "#C084FC" }}>
              PM EVENING REGIMEN
            </h2>
            {pmRoutine.map((step) => (
              <div key={step.step} style={{ backgroundColor: "#0B0F19", padding: "12px", borderRadius: "10px", marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748B" }}>STEP {step.step} • {step.category}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "#F8FAFC", marginTop: "3px" }}>{step.name}</div>
                <div style={{ fontSize: "11px", color: "#94A3B8", marginTop: "4px" }}>INCI: {step.ingredients.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Clinician Notes */}
      {activeTab === "notes" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
          <div>
            <h2 style={{ fontSize: "15px", fontWeight: "700", margin: "0 0 14px 0", color: "#F8FAFC" }}>
              Clinician Guidance History
            </h2>
            {notesList.map((n) => (
              <div key={n.id} style={{ backgroundColor: "#161E2E", borderRadius: "14px", border: "1px solid #1F2937", padding: "16px", marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#38BDF8" }}>{n.clinician}</span>
                  <span style={{ fontSize: "11px", color: "#64748B" }}>{n.date}</span>
                </div>
                <p style={{ fontSize: "13px", color: "#E2E8F0", lineHeight: "19px", margin: 0 }}>{n.message}</p>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#161E2E", borderRadius: "16px", border: "1px solid #1F2937", padding: "20px", height: "fit-content" }}>
            <h2 style={{ fontSize: "14px", fontWeight: "700", margin: "0 0 6px 0", color: "#F8FAFC" }}>
              Send Clinical Advice to Patient
            </h2>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 14px 0" }}>
              Appears as an actionable notification in the patient's SkinSense app.
            </p>
            <form onSubmit={handleSendNote}>
              <textarea
                rows={5}
                placeholder="Enter clinical recommendations, dosage guidance, or next steps..."
                value={doctorNote}
                onChange={(e) => setDoctorNote(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#0B0F19",
                  border: "1px solid #334155",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#F8FAFC",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: "12px",
                }}
              />
              <button
                type="submit"
                disabled={sendingNote || !doctorNote.trim()}
                style={{
                  width: "100%",
                  backgroundColor: "#0284C7",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Send size={15} />
                {sendingNote ? "Sending..." : "Dispatch to Patient App"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
