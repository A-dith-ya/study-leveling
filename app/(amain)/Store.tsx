import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StickerCard from "../components/store/StickerCard";
import CoinBalance from "../components/store/CoinBalance";
import LoadingScreen from "../components/common/LoadingScreen";
import { useUserData } from "../hooks/useUser";
import useCosmeticStore from "../stores/cosmeticStore";
import { Cosmetic } from "../types/storeTypes";
import COLORS from "../constants/colors";

export default function Store() {
  const { data: userData, isLoading } = useUserData();
  const { available, isBoughtToday, hasEnoughCoins, purchaseCosmetic } =
    useCosmeticStore();

  const coins = userData?.coins ?? 0;
  const [prevCoins, setPrevCoins] = useState<number>(coins);

  // Save previous coin amount for animation
  useEffect(() => {
    if (prevCoins === undefined) {
      setPrevCoins(coins);
    } else if (coins !== prevCoins) {
      setPrevCoins(coins);
    }
  }, [coins]);

  // Handle purchase
  const handleBuySticker = (stickerId: string) => {
    purchaseCosmetic(stickerId);
  };

  // Render sticker card
  const renderStickerCard = ({ item }: { item: Cosmetic }) => (
    <StickerCard
      sticker={item}
      isBoughtToday={isBoughtToday(item.id)}
      hasEnoughCoins={hasEnoughCoins(item.price)}
      onBuy={handleBuySticker}
    />
  );

  if (isLoading) return <LoadingScreen message="Loading store..." />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Sticker Store</Text>
        <CoinBalance coins={coins} prevCoins={prevCoins} />
      </View>

      {/* Sticker Grid */}
      <FlatList
        data={available}
        keyExtractor={(item) => item.id}
        renderItem={renderStickerCard}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No stickers available yet - come back soon!
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.refreshNotice}>
            <Text style={styles.refreshText}>
              Stickers can be purchased once per day!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    alignItems: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
  refreshNotice: {
    backgroundColor: COLORS.secondary,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshText: {
    color: COLORS.white,
    fontWeight: "500",
  },
});
