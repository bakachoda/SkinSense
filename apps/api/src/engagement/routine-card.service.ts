import { Injectable } from "@nestjs/common";
import { PrintableRoutineCardData, RoutineCardStep } from "@skinsense/types";

@Injectable()
export class RoutineCardService {
  /**
   * Generates printable routine card data
   */
  async generateRoutineCard(userName = "Alex"): Promise<PrintableRoutineCardData> {
    const amSteps: RoutineCardStep[] = [
      {
        step: 1,
        name: "Gentle Foaming Cleanser",
        category: "Cleanser",
        amount: "Dime-sized with lukewarm water",
        waitTimeMinutes: 0,
      },
      {
        step: 2,
        name: "Hyaluronic Acid 2% + B5",
        category: "Hydration",
        amount: "3-4 drops on damp skin",
        waitTimeMinutes: 1,
      },
      {
        step: 3,
        name: "Niacinamide 10% + Zinc 1%",
        category: "Seum Regulation",
        amount: "2-3 drops patted evenly",
        waitTimeMinutes: 2,
      },
      {
        step: 4,
        name: "Natural Moisturizing Factors + Phytoceramides",
        category: "Moisturizer",
        amount: "Pea-sized amount",
        waitTimeMinutes: 3,
      },
      {
        step: 5,
        name: "Mineral UV Filters SPF 50 with Antioxidants",
        category: "Sunscreen",
        amount: "Two finger lengths",
        waitTimeMinutes: 0,
      },
    ];

    const pmSteps: RoutineCardStep[] = [
      {
        step: 1,
        name: "Squalane Cleanser (First Cleanse)",
        category: "Oil Cleanse",
        amount: "Nickel-sized rubbed between dry palms",
        waitTimeMinutes: 0,
      },
      {
        step: 2,
        name: "Gentle Foaming Cleanser (Second Cleanse)",
        category: "Water Cleanse",
        amount: "Dime-sized, rinse thoroughly",
        waitTimeMinutes: 0,
      },
      {
        step: 3,
        name: "Azelaic Acid 10% Suspension",
        category: "Active Treatment",
        amount: "Pea-sized on dry skin",
        waitTimeMinutes: 5,
      },
      {
        step: 4,
        name: "Barrier Support Ceramide Cream",
        category: "Night Barrier",
        amount: "Generous pea-sized layer",
        waitTimeMinutes: 0,
      },
    ];

    return {
      userName,
      generatedDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amSteps,
      pmSteps,
      weeklyChecklistDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      verificationQrPayload: `skinsense://routine/card-verify?v=1&date=${Date.now()}`,
    };
  }

  /**
   * Generates clean printable HTML for printing or PDF rendering
   */
  async renderHtmlCard(data: PrintableRoutineCardData): Promise<string> {
    const amHtml = data.amSteps
      .map(
        (s) => `
        <div class="step-card">
          <div class="step-badge">${s.step}</div>
          <div class="step-info">
            <div class="step-name">${s.name}</div>
            <div class="step-category">${s.category} • <span class="step-amount">${s.amount}</span></div>
            ${s.waitTimeMinutes > 0 ? `<div class="wait-pill">Wait ${s.waitTimeMinutes} min</div>` : ""}
          </div>
        </div>
      `,
      )
      .join("");

    const pmHtml = data.pmSteps
      .map(
        (s) => `
        <div class="step-card">
          <div class="step-badge pm">${s.step}</div>
          <div class="step-info">
            <div class="step-name">${s.name}</div>
            <div class="step-category">${s.category} • <span class="step-amount">${s.amount}</span></div>
            ${s.waitTimeMinutes > 0 ? `<div class="wait-pill">Wait ${s.waitTimeMinutes} min</div>` : ""}
          </div>
        </div>
      `,
      )
      .join("");

    const checklistHeader = data.weeklyChecklistDays
      .map((d) => `<th class="chk-day">${d}</th>`)
      .join("");
    const amChecklist = data.weeklyChecklistDays
      .map(() => `<td><div class="box"></div></td>`)
      .join("");
    const pmChecklist = data.weeklyChecklistDays
      .map(() => `<td><div class="box"></div></td>`)
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>SkinSense Clinical Routine Card</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .sub { font-size: 13px; color: #64748b; font-weight: 500; }
          .columns { display: flex; gap: 24px; }
          .col { flex: 1; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; background: #fafafa; }
          .col-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .step-card { display: flex; gap: 12px; margin-bottom: 12px; padding: 10px; background: white; border-radius: 8px; border: 1px solid #e2e8f0; }
          .step-badge { width: 26px; height: 26px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; }
          .step-badge.pm { background: #6366f1; }
          .step-name { font-size: 14px; font-weight: 600; }
          .step-category { font-size: 12px; color: #64748b; margin-top: 2px; }
          .step-amount { color: #0284c7; font-weight: 500; }
          .wait-pill { display: inline-block; font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; margin-top: 4px; font-weight: 600; }
          .tracker-table { width: 100%; margin-top: 24px; border-collapse: collapse; }
          .tracker-table th, .tracker-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
          .box { width: 18px; height: 18px; border: 2px solid #94a3b8; border-radius: 4px; margin: 0 auto; }
          .footer { margin-top: 20px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">SKINSENSE CLINICAL ROUTINE</div>
            <div class="sub">Patient: ${data.userName} • Generated: ${data.generatedDate}</div>
          </div>
          <div class="sub">Bathroom Mirror Guide</div>
        </div>

        <div class="columns">
          <div class="col">
            <div class="col-title" style="color: #0284c7;">☀️ Morning Protocol (AM)</div>
            ${amHtml}
          </div>
          <div class="col">
            <div class="col-title" style="color: #4338ca;">🌙 Evening Protocol (PM)</div>
            ${pmHtml}
          </div>
        </div>

        <table class="tracker-table">
          <thead>
            <tr>
              <th style="text-align: left; width: 100px;">Adherence</th>
              ${checklistHeader}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600; font-size: 12px;">AM Routine</td>
              ${amChecklist}
            </tr>
            <tr>
              <td style="font-weight: 600; font-size: 12px;">PM Routine</td>
              ${pmChecklist}
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Medical Disclaimer: SkinSense recommendations do not constitute formal medical diagnosis. Verify all active ingredients with your board-certified dermatologist.
        </div>
      </body>
      </html>
    `;
  }
}
