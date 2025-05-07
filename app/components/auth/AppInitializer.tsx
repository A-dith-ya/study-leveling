import { useEffect, useRef } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import useUserStore from "@/app/stores/userStore";
import useAchievementStore from "@/app/stores/achievementStore";

export default function AppInitializer() {
  const { authStatus, user: authUser } = useAuthenticator(); // ← fix selector
  const hasRunRef = useRef(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (authStatus === "authenticated" && !hasRunRef.current) {
        hasRunRef.current = true;

        const { fetchUser, user } = useUserStore.getState();
        const { hasInitialized, fetchAchievements } =
          useAchievementStore.getState();

        if (!user) await fetchUser();

        const userId = user?.id || authUser?.userId;

        if (userId && !hasInitialized) {
          await fetchAchievements(userId);
        }
      }
    };

    initializeApp();
  }, [authStatus]);

  return null;
}
