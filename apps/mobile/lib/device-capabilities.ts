import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type {
  DeviceCapabilities,
  DeviceProfile,
  HardwareTier,
} from "@skinsense/types";

const DEVICE_PROFILE_STORAGE_KEY = "skinsense_device_profile_v1";
const memoryCache = new Map<string, string>();

export async function detectDeviceCapabilities(): Promise<DeviceCapabilities> {
  const isIOS = Platform.OS === "ios";
  const osVersion = String(Platform.Version);

  const isFlagship = isIOS ? Number(osVersion) >= 16 : Number(osVersion) >= 30;

  const caps: DeviceCapabilities = {
    hasRAW: true,
    hasLiDAR: isIOS,
    hasTrueDepth: isIOS,
    hasMacro: true,
    hasTelephoto: isFlagship,
    hasUltrawide: true,
    hasMultiCam: true,
    has240fps: isFlagship,
    has120fps: true,
    has60fps: true,
    hasOIS: true,
    hasEIS: true,
    maxPhotoResolution: isFlagship
      ? { width: 8064, height: 6048 }
      : { width: 4032, height: 3024 },
    maxVideoResolution: { width: 3840, height: 2160 },
    nativeSensorResolution: isFlagship
      ? { width: 8064, height: 6048 }
      : { width: 4032, height: 3024 },
    hasGyroscope: true,
    hasAccelerometer: true,
    hasBarometer: isFlagship,
    hasNeuralEngine: isIOS,
    hasNNAPI: !isIOS,
    maxDisplayBrightness: isFlagship ? 2000 : 1000,
    supportsWideColor: true,
    hardwareTier: isFlagship ? "TIER_1_FLAGSHIP" : "TIER_2_MIDRANGE",
  };

  return caps;
}

export async function getCachedDeviceProfile(): Promise<DeviceProfile | null> {
  try {
    const raw =
      (await SecureStore.getItemAsync(DEVICE_PROFILE_STORAGE_KEY)) ||
      memoryCache.get(DEVICE_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    const raw = memoryCache.get(DEVICE_PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}

export async function saveCachedDeviceProfile(profile: DeviceProfile): Promise<void> {
  const str = JSON.stringify(profile);
  memoryCache.set(DEVICE_PROFILE_STORAGE_KEY, str);
  try {
    await SecureStore.setItemAsync(DEVICE_PROFILE_STORAGE_KEY, str);
  } catch (err) {
    // Falls back to in-memory cache gracefully
  }
}
