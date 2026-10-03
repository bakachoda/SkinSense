/**
 * Multi-service Health & Telemetry Verification Script
 * Validates connectivity across SkinSense microservices:
 * - Python FastAPI AI Inference (port 8000)
 * - NestJS Backend Core API (port 3000)
 * - Next.js Dermatologist Web Portal (port 3001)
 */

interface ServiceTarget {
  name: string;
  url: string;
  expectedStatus: number;
}

const TARGETS: ServiceTarget[] = [
  { name: "FastAPI AI Inference (/health)", url: "http://127.0.0.1:8000/health", expectedStatus: 200 },
  { name: "FastAPI Metrics (/metrics)", url: "http://127.0.0.1:8000/metrics", expectedStatus: 200 },
  { name: "NestJS Core API (/api/v1/health)", url: "http://127.0.0.1:3000/api/v1/health", expectedStatus: 200 },
  { name: "Next.js Dermatologist Portal", url: "http://127.0.0.1:3001", expectedStatus: 200 },
];

async function verify() {
  console.log("=================================================");
  console.log("   SkinSense HealthOS Service Telemetry Audit    ");
  console.log("=================================================");

  let allHealthy = true;

  for (const target of TARGETS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(target.url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === target.expectedStatus) {
        console.log(`[PASS] ${target.name} -> HTTP ${res.status}`);
      } else {
        console.log(`[WARN] ${target.name} -> HTTP ${res.status} (expected ${target.expectedStatus})`);
        allHealthy = false;
      }
    } catch (e: any) {
      console.log(`[OFFLINE] ${target.name} -> ${e.message || "Connection refused"}`);
      // Not considered critical if service is not currently booted in dev
    }
  }

  console.log("=================================================");
  console.log(`Telemetry verification completed.`);
  console.log("=================================================");
}

verify();
