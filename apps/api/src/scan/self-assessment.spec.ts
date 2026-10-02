import { crossReferenceFindings } from "./self-assessment";
import type { Finding } from "@skinsense/types";

describe("Phase 3 Self-Assessment Cross-Referencing Logic", () => {
  const mockAiFindings: Finding[] = [
    {
      id: "f-1",
      type: "papule",
      zone: "left_cheek",
      severity: 65,
      confidence: 0.85,
      description: "Inflammatory papule on left cheek",
    },
    {
      id: "f-2",
      type: "comedone",
      zone: "nose",
      severity: 40,
      confidence: 0.78,
      description: "Closed comedones on nose",
    },
    {
      id: "f-3",
      type: "redness_patch",
      zone: "forehead",
      severity: 30,
      confidence: 0.42,
      description: "Subtle erythema on forehead",
    },
  ];

  it("assigns HIGH confidence when both AI and user identify concern", () => {
    const userSelections = [
      {
        zone: "left_cheek" as const,
        concerns: ["active_acne", "papule"],
      },
    ];

    const calibrated = crossReferenceFindings(mockAiFindings, userSelections, []);
    const cheekFinding = calibrated.find((f) => f.zone === "left_cheek");

    expect(cheekFinding).toBeDefined();
    expect(cheekFinding?.calibratedConfidence).toBe("HIGH");
    expect(cheekFinding?.source).toBe("ai_and_user");
  });

  it("assigns MODERATE confidence with 'We also noticed...' when AI detected but user did not select", () => {
    const userSelections = [
      {
        zone: "left_cheek" as const,
        concerns: ["papule"],
      },
    ];

    const calibrated = crossReferenceFindings(mockAiFindings, userSelections, []);
    const noseFinding = calibrated.find((f) => f.zone === "nose");

    expect(noseFinding).toBeDefined();
    expect(noseFinding?.calibratedConfidence).toBe("MODERATE");
    expect(noseFinding?.source).toBe("ai_only");
    expect(noseFinding?.label).toBe("We also noticed...");
  });

  it("marks finding for reanalysis when user marks but AI confidence is low", () => {
    const userSelections = [
      {
        zone: "forehead" as const,
        concerns: ["redness"],
      },
    ];

    const calibrated = crossReferenceFindings(mockAiFindings, userSelections, []);
    const foreheadFinding = calibrated.find((f) => f.zone === "forehead");

    expect(foreheadFinding).toBeDefined();
    expect(foreheadFinding?.calibratedConfidence).toBe("LOW");
    expect(foreheadFinding?.source).toBe("user_only");
    expect(foreheadFinding?.reanalyze).toBe(true);
  });

  it("adds user touch-to-mark spot markers if AI missed them", () => {
    const userSpots = [
      {
        id: "spot-chin-1",
        x: 0.52,
        y: 0.88,
        zone: "chin" as const,
        userNote: "Persistent bump here for 3 weeks",
      },
    ];

    const calibrated = crossReferenceFindings(mockAiFindings, [], userSpots);
    const chinFinding = calibrated.find((f) => f.zone === "chin");

    expect(chinFinding).toBeDefined();
    expect(chinFinding?.source).toBe("user_only");
    expect(chinFinding?.description).toBe("Persistent bump here for 3 weeks");
    expect(chinFinding?.reanalyze).toBe(true);
  });
});
