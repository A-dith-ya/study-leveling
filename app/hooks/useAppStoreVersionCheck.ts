import { useState, useEffect } from "react";
import { Platform, Linking } from "react-native";
import Constants from "expo-constants";
import { logger } from "@/app/utils/logger";

interface VersionCheckResult {
  needsUpdate: boolean;
  currentVersion: string;
  storeVersion: string;
  storeUrl?: string;
  releaseNotes?: string;
}

export const useAppStoreVersionCheck = () => {
  const [versionInfo, setVersionInfo] = useState<VersionCheckResult | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareVersions = (version1: string, version2: string): number => {
    const v1parts = version1.split(".").map(Number);
    const v2parts = version2.split(".").map(Number);

    const maxLength = Math.max(v1parts.length, v2parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  };

  const checkStoreVersion = async (): Promise<VersionCheckResult | null> => {
    // Skip version checking in development mode
    if (__DEV__) {
      logger.info("Skipping version check in development mode");
      return null;
    }

    setIsChecking(true);
    setError(null);

    const currentVersion = Constants.expoConfig?.version || "1.0.0";
    // const currentVersion = "1.0.0";

    try {
      if (Platform.OS === "ios") {
        const bundleId = Constants.expoConfig?.ios?.bundleIdentifier;

        if (!bundleId) {
          throw new Error("iOS bundle identifier not found");
        }

        const response = await fetch(
          `https://itunes.apple.com/lookup?bundleId=${bundleId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`iTunes API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const appInfo = data.results[0];
          logger.info("iOS app info fetched from App Store", {
            appInfo,
          });
          const storeVersion = appInfo.version;
          const storeUrl = appInfo.trackViewUrl;
          const releaseNotes = appInfo.releaseNotes || "";

          const result: VersionCheckResult = {
            needsUpdate: compareVersions(currentVersion, storeVersion) < 0,
            currentVersion,
            storeVersion,
            storeUrl,
            releaseNotes,
          };

          logger.info("iOS version check completed", {
            currentVersion,
            storeVersion,
            needsUpdate: result.needsUpdate,
          });

          return result;
        } else {
          throw new Error("App not found in App Store");
        }
      } else if (Platform.OS === "android") {
        // Implement Google Play API
        const packageName = Constants.expoConfig?.android?.package;

        if (!packageName) {
          throw new Error("Android package name not found");
        }

        return {
          needsUpdate: false,
          currentVersion,
          storeVersion: currentVersion,
          storeUrl: `https://play.google.com/store/apps/details?id=${packageName}`,
        };
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      logger.error("Store version check failed", { error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsChecking(false);
    }

    return null;
  };

  const openStoreUpdate = () => {
    if (versionInfo?.storeUrl) {
      Linking.openURL(versionInfo.storeUrl);
    }
  };

  const dismissUpdate = () => {
    setVersionInfo(null);
  };

  useEffect(() => {
    checkStoreVersion().then(setVersionInfo);
  }, []);

  return {
    versionInfo,
    isChecking,
    error,
    checkStoreVersion,
    openStoreUpdate,
    dismissUpdate,
  };
};
