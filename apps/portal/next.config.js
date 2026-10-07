const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        message: /There are multiple modules with names that only differ in casing/,
      },
    ];
    return config;
  },
};

module.exports = nextConfig;
