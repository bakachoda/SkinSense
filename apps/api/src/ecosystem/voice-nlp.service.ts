import { Injectable } from "@nestjs/common";
import { ExtractedVoiceSignals } from "@skinsense/types";

@Injectable()
export class VoiceNlpService {
  /**
   * Extracts structured clinical and behavioral signals from user speech transcription.
   */
  extractSignalsFromTranscript(transcript: string): ExtractedVoiceSignals {
    const text = transcript.toLowerCase();

    const productChanges: ExtractedVoiceSignals["productChanges"] = [];
    const concerns: ExtractedVoiceSignals["concerns"] = [];
    const triggers: ExtractedVoiceSignals["triggers"] = [];
    const timeline: ExtractedVoiceSignals["timeline"] = [];
    const sensations: ExtractedVoiceSignals["sensations"] = [];

    // 1. Product change extraction
    const productKeywords = ["moisturizer", "cleanser", "serum", "retinol", "sunscreen", "toner", "tretinoin", "cream", "oil"];
    for (const kw of productKeywords) {
      if (text.includes(`started ${kw}`) || text.includes(`started using ${kw}`)) {
        productChanges.push({ product: kw, action: "started", timeframe: this.extractTimeframe(text) || "recently" });
      } else if (text.includes(`stopped ${kw}`) || text.includes(`stopped using ${kw}`)) {
        productChanges.push({ product: kw, action: "stopped", timeframe: this.extractTimeframe(text) || "recently" });
      } else if (text.includes(`switched ${kw}`) || text.includes(`changed ${kw}`)) {
        productChanges.push({ product: kw, action: "changed", timeframe: this.extractTimeframe(text) || "recently" });
      }
    }

    // 2. Zone & Concern extraction
    const zones = ["forehead", "chin", "nose", "cheek", "jawline", "periorbital", "around mouth"];
    const concernWords = ["breakout", "acne", "pimple", "redness", "bump", "dryness", "flake", "spots", "rash"];

    for (const cw of concernWords) {
      if (text.includes(cw)) {
        const matchedZone = zones.find((z) => text.includes(z));
        concerns.push({
          description: cw,
          zone: matchedZone || "general face",
          severity: text.includes("severe") || text.includes("terrible") ? "severe" : text.includes("mild") ? "mild" : "moderate",
        });
      }
    }

    // 3. Trigger extraction
    const triggerWords = ["dairy", "sugar", "stress", "sun", "travel", "late nights", "period", "sweat", "mask"];
    for (const tw of triggerWords) {
      if (text.includes(tw)) {
        triggers.push({
          trigger: tw,
          correlation: "Potential symptom exacerbation reported by patient",
        });
      }
    }

    // 4. Sensations extraction
    const feelingWords = ["burning", "stinging", "itching", "tightness", "peeling", "irritated"];
    for (const fw of feelingWords) {
      if (text.includes(fw)) {
        const matchedZone = zones.find((z) => text.includes(z));
        sensations.push({
          feeling: fw,
          zone: matchedZone || "general face",
        });
      }
    }

    // 5. Timeline extraction
    const timeframeMatch = text.match(/(last week|yesterday|two days ago|few days ago|last month|2 weeks ago|a couple of weeks ago)/i);
    if (timeframeMatch) {
      timeline.push({
        event: "Reported symptom shift",
        when: timeframeMatch[0],
      });
    }

    return {
      productChanges,
      concerns,
      triggers,
      timeline,
      sensations,
    };
  }

  private extractTimeframe(text: string): string | null {
    const match = text.match(/(last week|a week ago|2 weeks ago|few days ago|yesterday|recently)/i);
    return match ? match[0] : null;
  }
}
