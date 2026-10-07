import React from "react";

export const metadata = {
  title: "SkinSense Dermatologist Collaboration Portal",
  description: "Secure, clinical-grade patient intake and longitudinal telemetry for dermatologists",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#0B0F19",
          color: "#F8FAFC",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
