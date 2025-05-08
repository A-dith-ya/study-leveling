import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";
import useChallengeStore from "@/app/stores/challengeStore";

import { logger } from "@/app/utils/logger";

export default function AppInitializer() {
  const { authStatus, user: authUser } = useAuthenticator();
  const hasRunRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);

  logger.debug("AppInitializer rendered");

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

        // Check if challenges need to be reset
        if (shouldResetChallenges()) {
          logger.debug("Resetting challenges after app became active");
          initializeDailyChallenges();
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

        if (!user) await fetchUser();

        const userId = user?.id || authUser?.userId;

        if (userId && !achievementsInitialized) {
          await fetchAchievements(userId);
        }

        // Initialize or reset daily challenges if needed
        if (!challengesInitialized || shouldResetChallenges()) {
          logger.debug("Initializing daily challenges");
          initializeDailyChallenges();
        }
      }
    };

    logger.debug("Authenticator status:", authStatus);

    initializeApp();
  }, [authStatus]);

  return null;
}
