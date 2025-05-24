import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { StickerCardProps } from "@/app/types/storeTypes";
import { formatTitle } from "@/app/utils/stickerUtils";
import COLORS from "@/app/constants/colors";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 48) / 2;

export function StickerCard({
  sticker,
  isBoughtToday,
  hasEnoughCoins,
  onBuy,
}: StickerCardProps) {
  const [showBought, setShowBought] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  // Handle buying the sticker
  const handleBuy = () => {
    if (isBoughtToday || !hasEnoughCoins) return;

    // Animate the card
    scale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );

    // Show success message temporarily
    setShowBought(true);
    setTimeout(() => setShowBought(false), 1500);

    // Call the buy handler
    onBuy(sticker.id);
  };

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: glow.value,
    };
  });

  // Card status styles
  const getBuyButtonStyle = () => {
    if (isBoughtToday) {
      return [styles.buyButton, styles.boughtButton];
    }
    if (!hasEnoughCoins) {
      return [styles.buyButton, styles.disabledButton];
    }
    return [styles.buyButton, styles.activeButton];
  };

  // Get the right text for the button
  const getButtonText = () => {
    if (showBought) return "✓ Bought!";
    if (isBoughtToday) return "Bought Today";
    return `${sticker.price}`;
  };

  // Handle press-in animation
  const handlePressIn = () => {
    if (!isBoughtToday && hasEnoughCoins) {
      scale.value = withSpring(1.05);
      glow.value = withTiming(0.8);
    }
  };

  // Handle press-out animation
  const handlePressOut = () => {
    scale.value = withSpring(1);
    glow.value = withTiming(0.3);
  };

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <View style={styles.imageContainer}>
        <Image source={sticker.image} style={styles.image} />
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {formatTitle(sticker.id)}
      </Text>

      <Pressable
        style={getBuyButtonStyle()}
        onPress={handleBuy}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isBoughtToday || !hasEnoughCoins}
      >
        {!isBoughtToday && (
          <Image
            source={require("@/assets/images/coin.webp")}
            style={styles.coinIcon}
          />
        )}
        <Text style={styles.buyButtonText}>{getButtonText()}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 8,
    margin: 8,
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.lightGray,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  buyButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  activeButton: {
    backgroundColor: COLORS.primary,
  },
  disabledButton: {
    backgroundColor: COLORS.lightGray,
  },
  boughtButton: {
    backgroundColor: COLORS.mediumGray,
  },
  coinIcon: {
    width: 34,
    height: 24,
  },
  buyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default StickerCard;
