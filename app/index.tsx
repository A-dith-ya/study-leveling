import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";

import SignOutButton from "./components/auth/SignOutButton";
import DashboardHeader from "./components/dashboard/DashboardHeader";
import DeckCard from "./components/dashboard/DeckCard";
import { getUserById } from "./services/userService";
import useUserStore from "./stores/userStore";
import { calculateXPToNextLevel } from "./utils/xpUtils";

export default function Index() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, []);

  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserById(user?.id || ""),
    enabled: !!user?.id,
  });

  if (isLoading) return <ActivityIndicator />;

  return (
    <View>
      <SignOutButton />
      <DashboardHeader
        level={userData?.data?.level || 1}
        currentXP={userData?.data?.xp || 0}
        requiredXP={calculateXPToNextLevel(userData?.data?.level || 1)}
        streakCount={userData?.data?.streak || 0}
      />
      <DeckCard
        title="Deck 1"
        cardCount={10}
        onEdit={() => {}}
        onPractice={() => {}}
      />
    </View>
  );
}
