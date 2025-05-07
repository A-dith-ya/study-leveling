import { View, Pressable, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import SignOutButton from "../components/auth/SignOutButton";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DeckCard from "../components/dashboard/DeckCard";
import LoadingScreen from "../components/common/LoadingScreen";
import { getDecksByUserId } from "../services/deckService";
import useUserStore from "../stores/userStore";
import { calculateXPToNextLevel } from "../utils/xpUtils";
import COLORS from "../constants/colors";
import { useUserData } from "../hooks/useUser";

export default function Index() {
  const { user } = useUserStore();

  const { data: userData, isLoading, error } = useUserData();

  const {
    data: decks,
    isLoading: decksLoading,
    error: decksError,
  } = useQuery({
    queryKey: ["decks", user?.id],
    queryFn: () => getDecksByUserId(user?.id || ""),
    enabled: !!user?.id,
  });

  if (isLoading) return <LoadingScreen />;
  if (decksLoading) return <LoadingScreen message="Loading decks..." />;

  if (error || decksError) return <Text>Error {error?.message} </Text>;

  const renderDeckItem = ({ item }: { item: any }) => (
    <DeckCard
      title={item.title}
      cardCount={item.flashcardCount}
      onEdit={() =>
        router.push(`/(flashcard)/EditFlashcard?deckId=${item.deckId}`)
      }
      onPractice={() => {
        router.push(`/(flashcard)/FlashcardReview?deckId=${item.deckId}`);
      }}
    />
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No decks yet. Create your first deck to get started!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SignOutButton />
      <DashboardHeader
        level={userData?.data?.level || 1}
        currentXP={userData?.data?.xp || 0}
        requiredXP={calculateXPToNextLevel(userData?.data?.level || 1)}
        streakCount={userData?.data?.streak || 0}
      />
      <View style={styles.listContainer}>
        <FlashList
          data={decks}
          renderItem={renderDeckItem}
          estimatedItemSize={100}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.listContentContainer}
        />
      </View>

      <Pressable
        style={styles.createDeckButton}
        onPress={() => router.push("/(flashcard)")}
      >
        <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
        <Text style={styles.createDeckButtonText}>Create Deck</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  createDeckButton: {
    width: "50%",
    alignSelf: "center",
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  createDeckButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyStateText: {
    textAlign: "center",
    color: COLORS.darkGray,
    fontSize: 16,
  },
});
