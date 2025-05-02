import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import SignOutButton from "./components/auth/SignOutButton";

import DashboardHeader from "./components/dashboard/DashboardHeader";
import DeckCard from "./components/dashboard/DeckCard";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import { useQuery } from "@tanstack/react-query";
import { getUserById } from "./services/userService";
import useUserStore from "./stores/userStore";

const client = generateClient<Schema>();

export default function Index() {
  const { user, fetchUser } = useUserStore();

  useEffect(() => {
    if (!user) fetchUser();
  }, [fetchUser]);

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
        requiredXP={100}
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
