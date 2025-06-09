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
        const packageName = Constants.expoConfig?.android?.package;

        if (!packageName) {
          throw new Error("Android package name not found");
        }

        try {
          // Fetch Google Play Store page
          const playStoreUrl = `https://play.google.com/store/apps/details?id=${packageName}`;
          const response = await fetch(playStoreUrl, {
            method: "GET",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
              "Accept-Encoding": "gzip, deflate, br",
              "Cache-Control": "no-cache",
            },
          });

          if (!response.ok) {
            throw new Error(
              `Google Play Store request failed: ${response.status}`
            );
          }

          const html = await response.text();

          // Extract version using regex patterns
          let storeVersion = currentVersion; // fallback
          let releaseNotes = ""; // Extract release notes for Android

          // Try multiple patterns to find version information
          const versionPatterns = [
            // Pattern 1: Version in app info section
            /\["([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)"\]/g,
            // Pattern 2: Version in metadata
            /"versionName":"([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)"/g,
            // Pattern 3: Version in structured data
            /Current Version.*?([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)/gi,
            // Pattern 4: Version in app details
            /Version.*?([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)/gi,
            // Pattern 5: More specific Google Play patterns
            /\[null,\[.*?"([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)"/g,
            // Pattern 6: Alternative JSON structure
            /,"([0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?)",null,/g,
          ];

          // Try multiple patterns to find release notes
          const releaseNotesPatterns = [
            // Pattern 1: What's new section with itemprop="description"
            /<div[^>]*itemprop="description"[^>]*>([^<]+(?:<br[^>]*>[^<]*)*)<\/div>/gi,
            // Pattern 2: What's new section content
            /<h2[^>]*>What's new<\/h2>.*?<div[^>]*>([^<]+(?:<br[^>]*>[^<]*)*)<\/div>/gis,
            // Pattern 3: Release notes in structured data
            /"What's new"[^<]*<[^>]*>([^<]+)</gi,
            // Pattern 4: Release notes in app description
            /\["What's new"\]\],[^,]*,"([^"]+)"/gi,
            // Pattern 5: Updates section
            /"recentChanges":"([^"]+)"/gi,
            // Pattern 6: What's new in JSON structure
            /whatsnew[^:]*:\s*"([^"]+)"/gi,
            // Pattern 7: Release notes in meta data
            /"releaseNotes":"([^"]+)"/gi,
            // Pattern 8: Description content after What's new header
            /What's new.*?<div[^>]*>([^<]+(?:<br[^>]*>[^<]*)*)/gis,
          ];

          let foundVersion = null;
          let foundReleaseNotes = "";

          for (let i = 0; i < versionPatterns.length; i++) {
            const pattern = versionPatterns[i];
            const matches = [...html.matchAll(pattern)];

            for (const match of matches) {
              const version = match[1];

              // Validate version format and ensure it's reasonable
              if (
                version &&
                /^[0-9]+\.[0-9]+(?:\.[0-9]+)?(?:\.[0-9]+)?$/.test(version)
              ) {
                // Skip obviously invalid versions (like build numbers)
                const parts = version.split(".").map(Number);
                if (parts[0] <= 100 && parts[1] <= 100) {
                  // Reasonable version bounds
                  foundVersion = version;
                  break;
                }
              }
            }
            if (foundVersion) break;
          }

          // Extract release notes
          for (let i = 0; i < releaseNotesPatterns.length; i++) {
            const pattern = releaseNotesPatterns[i];
            const matches = [...html.matchAll(pattern)];

            for (const match of matches) {
              let notes = match[1];
              if (notes && notes.length > 10) {
                // Ensure it's substantial content
                // Clean up HTML entities and formatting
                notes = notes
                  .replace(/<br\s*\/?>/gi, "\n") // Convert <br> tags to newlines first
                  .replace(/\\n/g, "\n")
                  .replace(/\\t/g, " ")
                  .replace(/\\"/g, '"')
                  .replace(/&quot;/g, '"')
                  .replace(/&amp;/g, "&")
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/<[^>]*>/g, "") // Remove remaining HTML tags
                  .replace(/\n\s*\n/g, "\n\n") // Clean up multiple newlines
                  .trim();

                if (notes.length > 20) {
                  // Ensure meaningful content
                  foundReleaseNotes = notes;
                  break;
                }
              }
            }
            if (foundReleaseNotes) break;
          }

          if (foundVersion) {
            storeVersion = foundVersion;
          }

          if (foundReleaseNotes) {
            releaseNotes = foundReleaseNotes;
          }

          const result = {
            needsUpdate: compareVersions(currentVersion, storeVersion) < 0,
            currentVersion,
            storeVersion,
            storeUrl: playStoreUrl,
            releaseNotes,
          };

          return result;
        } catch (fetchError) {
          // Fallback to static response if web scraping fails
          return {
            needsUpdate: false,
            currentVersion,
            storeVersion: currentVersion,
            storeUrl: `https://play.google.com/store/apps/details?id=${packageName}`,
          };
        }
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
