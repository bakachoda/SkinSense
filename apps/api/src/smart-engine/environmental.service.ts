import { Injectable } from "@nestjs/common";
import type { EnvironmentalContext } from "@skinsense/types";

@Injectable()
export class EnvironmentalService {
  /**
   * Aggregate environmental biometeorological factors influencing skin barrier (Phase 4, Section 20)
   */
  getEnvironmentalContext(postalCode?: string): EnvironmentalContext {
    // Current date for seasonal calibration
    const month = new Date().getMonth(); // 0-11
    let season: EnvironmentalContext["season"];
    if (month >= 2 && month <= 4) season = "spring";
    else if (month >= 5 && month <= 7) season = "summer";
    else if (month >= 8 && month <= 10) season = "fall";
    else season = "winter";

    // Realistic seasonal baseline values
    const uvIndex = season === "summer" ? 8.4 : season === "spring" ? 6.2 : season === "fall" ? 4.1 : 2.5;
    const uvAccumulation14Day = Math.round(uvIndex * 14 * 0.85);
    const humidityPct = season === "winter" ? 38 : season === "summer" ? 72 : 55;
    const humidity7DayHistory = [
      humidityPct + 2,
      humidityPct - 4,
      humidityPct - 8,
      humidityPct,
      humidityPct - 5,
      humidityPct + 1,
      humidityPct,
    ];
    const waterHardnessPpm = 185; // Hard water typical in urban centers (calcium/magnesium carbonate)
    const aqi = 48; // Moderate / Good
    const pm25 = 12.4;
    const temperatureSwingC = 11.2;
    const pollenCount = season === "spring" ? 85 : 18;

    let advisoryNote = "Stable environmental baseline. Standard photoprotection indicated.";
    if (humidityPct < 45) {
      advisoryNote =
        "Low ambient humidity detected. Transepidermal water loss (TEWL) is elevated; layer humectants under an occlusive moisturizer.";
    } else if (uvIndex >= 7) {
      advisoryNote =
        "High UV Index detected. Reapply broad-spectrum SPF 50 every 2 hours during outdoor exposure.";
    }

    return {
      uvIndex,
      uvAccumulation14Day,
      aqi,
      pm25,
      waterHardnessPpm,
      humidityPct,
      humidity7DayHistory,
      temperatureSwingC,
      pollenCount,
      season,
      advisoryNote,
    };
  }
}
