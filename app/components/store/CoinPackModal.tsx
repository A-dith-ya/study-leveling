import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from "react-native-purchases";
import { CoinPackModalProps } from "@/app/types/storeTypes";
import { COIN_PACK_INFO } from "@/app/constants/packs";
import COLORS from "@/app/constants/colors";
import { logger } from "@/app/utils/logger";

export default function CoinPackModal({
  visible,
  onClose,
  onPurchaseSuccess,
}: CoinPackModalProps) {
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasingPackage, setPurchasingPackage] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (visible) {
      fetchOfferings();
    }
  }, [visible]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const offerings = await Purchases.getOfferings();
      logger.debug("Offerings fetched:", offerings);

      if (
        offerings.current !== null &&
        offerings.current.availablePackages.length !== 0
      ) {
        setOfferings(offerings.current);
      }
    } catch (error) {
      logger.error("Error fetching offerings:", error);
      Alert.alert("Error", "Failed to load coin packs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasingPackage(packageToPurchase.identifier);
      const { customerInfo } =
        await Purchases.purchasePackage(packageToPurchase);
      logger.debug("Purchase successful, customerInfo:", customerInfo);

      // Get coin amount for this package
      const coinInfo = COIN_PACK_INFO[packageToPurchase.identifier];
      if (coinInfo) {
        logger.info(
          `Granting ${coinInfo.coinAmount} coins for package ${packageToPurchase.identifier}`
        );
        onPurchaseSuccess(coinInfo.coinAmount);
      }

      Alert.alert(
        "Purchase Successful!",
        `You've received ${coinInfo?.coinAmount || 0} coins!`,
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error: any) {
      logger.error("Purchase error:", error);
      if (!error.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setPurchasingPackage(null);
    }
  };

  const renderCoinPack = ({ item }: { item: PurchasesPackage }) => {
    const coinInfo = COIN_PACK_INFO[item.identifier];
    const isPurchasing = purchasingPackage === item.identifier;

    if (!coinInfo) return null;

    return (
      <View style={styles.packContainer}>
        <View style={styles.packContent}>
          <View style={styles.coinImageContainer}>
            {/* <Text style={styles.coinEmoji}>🪙</Text> */}
            <Image
              source={require("@/assets/images/coin.webp")}
              style={styles.coinIcon}
            />
          </View>

          <View style={styles.packInfo}>
            <Text style={styles.packTitle}>{coinInfo.title}</Text>
            <Text style={styles.packPrice}>{item.product.priceString}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.buyButton, isPurchasing && styles.buyButtonDisabled]}
          onPress={() => handlePurchase(item)}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buyButtonText}>Buy</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const availablePackages = offerings?.availablePackages || [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Buy Coins</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading coin packs...</Text>
            </View>
          ) : availablePackages.length > 0 ? (
            <FlatList
              data={availablePackages.sort(
                (a, b) =>
                  COIN_PACK_INFO[a.identifier].coinAmount -
                  COIN_PACK_INFO[b.identifier].coinAmount
              )}
              keyExtractor={(item) => item.identifier}
              renderItem={renderCoinPack}
              contentContainerStyle={styles.packsList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No coin packs available at the moment.
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    margin: 20,
    maxHeight: "80%",
    width: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.darkGray,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  packsList: {
    padding: 16,
  },
  packContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  packContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  coinImageContainer: {
    width: 50,
    height: 50,

    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  coinIcon: {
    width: "100%",
    height: "100%",
  },
  packInfo: {
    flex: 1,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  packPrice: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "600",
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.darkGray,
  },
  buyButtonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: "center",
  },
});
