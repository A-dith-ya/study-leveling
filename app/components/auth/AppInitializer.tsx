import { useEffect, useRef } from "react";
import { AppState, Platform } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";
import useChallengeStore from "@/app/stores/challengeStore";
import useCosmeticStore from "@/app/stores/cosmeticStore";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

import { logger } from "@/app/utils/logger";

export default function AppInitializer() {
  const { authStatus, user: authUser } = useAuthenticator();
  const hasRunRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  logger.debug("AppInitializer rendered");

  // Reset hasRunRef when auth status changes to unauthenticated
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      hasRunRef.current = false;
    }
  }, [authStatus]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // Check if app is coming from background to active state
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        logger.debug("App has come to the foreground!");
        const { shouldResetChallenges, initializeDailyChallenges } =
          useChallengeStore.getState();
        const { initializeStore } = useCosmeticStore.getState();

        // Check if challenges need to be reset
        if (shouldResetChallenges()) {
          logger.debug("Resetting challenges after app became active");
          initializeDailyChallenges();
          initializeStore();
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Initial app setup
  useEffect(() => {
    const initializeApp = async () => {
      if (authStatus === "authenticated" && !hasRunRef.current) {
        hasRunRef.current = true;

        const { fetchUser, user } = useUserStore.getState();
        const { hasInitialized: achievementsInitialized, fetchAchievements } =
          useAchievementStore.getState();
        const {
          hasInitialized: challengesInitialized,
          initializeDailyChallenges,
          shouldResetChallenges,
        } = useChallengeStore.getState();
        const { initializeStore } = useCosmeticStore.getState();

        if (!user) await fetchUser();

        const userId = user?.id || authUser?.userId;

        if (userId && !achievementsInitialized) {
          await fetchAchievements(userId);
        }

        // Initialize or reset daily challenges if needed
        if (!challengesInitialized || shouldResetChallenges()) {
          logger.debug("Initializing daily challenges");
          initializeDailyChallenges();
          initializeStore();
        }
      }
    };

    logger.debug("Authenticator status:", authStatus);

    initializeApp();
  }, [authStatus]);

  useEffect(() => {
    if (Platform.OS === "web") return;
    // Development mode, set log level to verbose for better debugging
    Purchases.setLogLevel(
      process.env.NODE_ENV === "development"
        ? LOG_LEVEL.VERBOSE
        : LOG_LEVEL.ERROR
    );

    const iosApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    const androidApiKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
    if (Platform.OS === "ios" && iosApiKey) {
      Purchases.configure({
        apiKey: iosApiKey,
      });
    } else if (Platform.OS === "android" && androidApiKey) {
      Purchases.configure({
        apiKey: androidApiKey,
      });
    }
  }, []);

  return null;
}
