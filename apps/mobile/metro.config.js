const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

const lowerRoot = monorepoRoot.replace(/skinsense/i, "skinsense");
const upperRoot = monorepoRoot.replace(/skinsense/i, "SkinSense");

// 1. Watch all files within the monorepo with case-insensitive variants for Windows
config.watchFolders = Array.from(new Set([monorepoRoot, lowerRoot, upperRoot]));

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

const nwConfig = withNativeWind(config, { input: "./global.css" });
const nwResolver = nwConfig.resolver.resolveRequest;

const normalizeCasing = (filePath) => {
  // Normalize casing on Windows to match Metro's project root casing
  return filePath.replace(/\\SkinSense\\/gi, "\\skinsense\\");
};

nwConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (path.isAbsolute(moduleName) && fs.existsSync(moduleName)) {
    return {
      type: "sourceFile",
      filePath: normalizeCasing(moduleName),
    };
  }

  if (moduleName.startsWith("react-native-css-interop")) {
    try {
      const resolved = require.resolve(moduleName, { paths: [projectRoot, monorepoRoot] });
      return {
        type: "sourceFile",
        filePath: normalizeCasing(resolved),
      };
    } catch {}
  }

  if (nwResolver) {
    const res = nwResolver(context, moduleName, platform);
    if (res && res.filePath) {
      res.filePath = normalizeCasing(res.filePath);
    }
    return res;
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = nwConfig;
