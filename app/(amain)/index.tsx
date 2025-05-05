import { useEffect } from "react";
import { View, Button, ActivityIndicator, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";

import SignOutButton from "../components/auth/SignOutButton";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DeckCard from "../components/dashboard/DeckCard";
import { getUserById } from "../services/userService";
import { getDecksByUserId } from "../services/deckService";
import useUserStore from "../stores/userStore";
import { calculateXPToNextLevel } from "../utils/xpUtils";
import COLORS from "../constants/colors";

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

  const {
    data: decks,
    isLoading: decksLoading,
    error: decksError,
  } = useQuery({
    queryKey: ["decks", user?.id],
    queryFn: () => getDecksByUserId(user?.id || ""),
    enabled: !!user?.id,
  });

  if (isLoading || decksLoading) return <ActivityIndicator />;

  if (error || decksError) return <Text>Error {error?.message} </Text>;

  return (
    <View>
      <SignOutButton />
      <DashboardHeader
        level={userData?.data?.level || 1}
        currentXP={userData?.data?.xp || 0}
        requiredXP={calculateXPToNextLevel(userData?.data?.level || 1)}
        streakCount={userData?.data?.streak || 0}
      />
      {decks?.data?.map((deck) => (
        <DeckCard
          key={deck.deckId}
          title={deck.title}
          cardCount={0}
          onEdit={() => {}}
          onPractice={() => {}}
        />
      ))}
      <Button
        title="Create Deck"
        color={COLORS.secondary}
        onPress={() => router.push("/(flashcard)")}
      />
    </View>
  );
}
