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
import { useUserData } from "../hooks/useUser";
import { useDecks } from "../hooks/useDeck";
import { calculateXPToNextLevel } from "../utils/xpUtils";
import COLORS from "../constants/colors";

interface DeckItem {
  title: string;
  flashcardCount: number;
  deckId: string;
}

export default function Index() {
  const { data: userData, isLoading, error } = useUserData();

  const {
    data: decks,
    isLoading: decksLoading,
    error: decksError,
  } = useDecks();

  if (isLoading) return <LoadingScreen />;
  if (decksLoading) return <LoadingScreen message="Loading decks..." />;

  if (error || decksError) return <Text>Error {error?.message} </Text>;

  const renderDeckItem = ({ item }: { item: DeckItem }) => (
    <DeckCard
      title={item.title}
      cardCount={item.flashcardCount}
      onEdit={() =>
        router.push(`/(flashcard)/EditFlashcard?deckId=${item.deckId}`)
      }
      onPractice={() => {
        router.push(`/(flashcard)/FlashcardReview?deckId=${item.deckId}`);
      }}
      onAIReview={() => {
        router.push(`/(flashcard)/AIReview?deckId=${item.deckId}`);
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
        level={userData?.level ?? 1}
        currentXP={userData?.xp ?? 0}
        requiredXP={calculateXPToNextLevel(userData?.level ?? 1)}
        streakCount={userData?.streak ?? 0}
        coins={userData?.coins ?? 0}
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

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.decorateButton}
          onPress={() => router.push("/(flashcard)/FlashcardDecoration")}
        >
          <Ionicons name="brush-outline" size={24} color={COLORS.white} />
        </Pressable>
        <Pressable
          style={styles.createDeckButton}
          onPress={() => router.push("/(flashcard)")}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
          <Text style={styles.createDeckButtonText}>Create Deck</Text>
        </Pressable>
      </View>
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
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 50,
  },
  decorateButton: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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
