import { Injectable } from "@nestjs/common";
import {
  SeasonalTransition,
  SeasonalTransitionType,
} from "@skinsense/types";

export interface WeatherDay {
  date: string;
  tempC: number;
  humidity: number; // 0 - 100
  uvIndex: number;
}

@Injectable()
export class SeasonalService {
  /**
   * Detects upcoming seasonal shifts 2 weeks in advance from weather trends.
   */
  detectSeasonalTransition(
    weatherHistory: WeatherDay[],
    weatherForecast: WeatherDay[],
  ): SeasonalTransition | null {
    if (!weatherHistory.length || !weatherForecast.length) {
      return null;
    }

    const currentHumidity =
      weatherHistory.slice(-7).reduce((acc, d) => acc + d.humidity, 0) / Math.min(weatherHistory.length, 7);
    const forecastHumidity =
      weatherForecast.slice(0, 14).reduce((acc, d) => acc + d.humidity, 0) / Math.min(weatherForecast.length, 14);

    const currentUv =
      weatherHistory.slice(-7).reduce((acc, d) => acc + d.uvIndex, 0) / Math.min(weatherHistory.length, 7);
    const forecastUv =
      weatherForecast.slice(0, 14).reduce((acc, d) => acc + d.uvIndex, 0) / Math.min(weatherForecast.length, 14);

    const humidityDrop = currentHumidity - forecastHumidity;
    const uvIncrease = forecastUv - currentUv;

    // 1. Major drying transition (e.g. Fall -> Winter)
    if (humidityDrop >= 18) {
      return {
        type: "DRYING",
        severity: Math.round(humidityDrop),
        fromSeason: "Fall",
        toSeason: "Winter",
        title: "Winter Dryness Approaching: Protect Your Moisture Barrier",
        recommendations: [
          "Swap to a richer ceramide lipid cream to prevent transepidermal water loss (TEWL)",
          "Reduce chemical exfoliation frequency from daily to 2x per week",
          "Apply humectants (hyaluronic acid, glycerin) to damp skin before occlusives",
        ],
        routineAdjustments: {
          moisturizerWeight: "heavy",
          spfTarget: 30,
          activeFrequencyAdjustment: "Reduce exfoliating acids by 50%",
        },
      };
    }

    // 2. Humidifying transition (e.g. Winter -> Spring / Summer)
    if (humidityDrop <= -18) {
      return {
        type: "HUMIDIFYING",
        severity: Math.round(Math.abs(humidityDrop)),
        fromSeason: "Winter",
        toSeason: "Spring",
        title: "Spring Thaw: Lighten Your Hydration Texture",
        recommendations: [
          "Transition to a lighter gel-cream moisturizer as natural sebum production recovers",
          "Re-introduce clarifying active serums gradually",
          "Upgrade daily sunscreen to water-resistant formulation",
        ],
        routineAdjustments: {
          moisturizerWeight: "light",
          spfTarget: 50,
          activeFrequencyAdjustment: "Resume standard antioxidant serum cadence",
        },
      };
    }

    // 3. High UV surge (Spring -> Summer)
    if (uvIncrease >= 2.5) {
      return {
        type: "UV_INCREASE",
        severity: Math.round(uvIncrease * 10),
        fromSeason: "Spring",
        toSeason: "Summer",
        title: "Peak UV Season: Prioritize Photoprotection",
        recommendations: [
          "Broad-spectrum SPF 50+ reapplication every 2 hours during outdoor exposure",
          "Incorporate topical Vitamin C / E antioxidants in AM routine to quench free radicals",
          "Buffer nightly retinoids if experiencing daytime sun erythema",
        ],
        routineAdjustments: {
          moisturizerWeight: "light",
          spfTarget: 50,
          activeFrequencyAdjustment: "Pause strong peeling solutions on high sun exposure weeks",
        },
      };
    }

    return null;
  }
}
