import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef } from "react";

import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DeckCard from "@/app/components/dashboard/DeckCard";
import LoadingScreen from "@/app/components/common/LoadingScreen";
import UpdateModal from "@/app/components/common/UpdateModal";
import CodeRedemptionModal from "@/app/components/common/CodeRedemptionModal";
import { useUserData, useUpdateUserCosmetics } from "@/app/hooks/useUser";
import { useDecks } from "@/app/hooks/useDeck";
import { useAppStoreVersionCheck } from "@/app/hooks/useAppStoreVersionCheck";
import { calculateXPToNextLevel } from "@/app/utils/xpUtils";
import COLORS from "@/app/constants/colors";
import { DeckItem } from "@/app/types/homeTypes";

export default function Index() {
  const { data: userData, isLoading } = useUserData();
  const { data: decks, isLoading: decksLoading } = useDecks();
  const { versionInfo, openStoreUpdate, dismissUpdate } =
    useAppStoreVersionCheck();
  const updateUserCosmeticsMutation = useUpdateUserCosmetics();

  // State for code redemption modal
  const [showCodeModal, setShowCodeModal] = useState(false);

  // Track tap count for the special feature
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);

  if (isLoading) return <LoadingScreen />;
  if (decksLoading) return <LoadingScreen message="Loading decks..." />;

  const handleIconTap = () => {
    tapCount.current += 1;

    // Clear existing timer
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    // Check if user tapped 7 times
    if (tapCount.current >= 7) {
      tapCount.current = 0;
      setShowCodeModal(true);
      return;
    }

    // Reset tap count after 1 second of no taps
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000);
  };

  const handleCodeRedeemed = (coins: number) => {
    const currentCoins = userData?.coins ?? 0;
    const ownedCosmetics = userData?.ownedCosmetics ?? [];

    updateUserCosmeticsMutation.mutate({
      coins: currentCoins + coins,
      ownedCosmetics,
    });

    setShowCodeModal(false);
  };

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
      <View style={styles.headerRow}>
        <Pressable style={styles.appBranding} onPress={handleIconTap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.appIcon}
          />
          <View>
            <Text style={styles.appTitle}>Study Leveling</Text>
            <Text style={styles.appSubtitle}>Learn • Level Up • Succeed</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => router.push("/(flashcard)/Account")}>
          <Ionicons name="person" size={34} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* App Store Update Modal */}
      {versionInfo?.needsUpdate && (
        <UpdateModal
          visible={true}
          currentVersion={versionInfo.currentVersion}
          storeVersion={versionInfo.storeVersion}
          releaseNotes={versionInfo.releaseNotes}
          onUpdate={openStoreUpdate}
          onNotNow={dismissUpdate}
        />
      )}

      {/* Code Redemption Modal */}
      <CodeRedemptionModal
        visible={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onCodeRedeemed={handleCodeRedeemed}
      />

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
          <Ionicons name="color-palette" size={24} color={COLORS.white} />
        </Pressable>
        <View style={styles.createDeckButtonWrapper}>
          <Pressable
            style={styles.createDeckButton}
            onPress={() => router.push("/(flashcard)")}
          >
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={COLORS.white}
            />
            <Text style={styles.createDeckButtonText}>Create Deck</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  appBranding: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appIcon: {
    width: 40,
    height: 40,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
  appSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    color: COLORS.primary,
    marginTop: 4,
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  decorateButton: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderBottomWidth: Platform.OS === "ios" ? 2 : 0,
    borderBottomColor: COLORS.secondaryDark,
  },
  createDeckButtonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  createDeckButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primaryDark,
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
