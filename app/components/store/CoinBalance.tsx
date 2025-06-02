import React, { useEffect, useState } from "react";
import { Text, Image, StyleSheet, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { animateValue } from "@/app/utils/animateUtils";
import { CoinBalanceProps } from "@/app/types/storeTypes";
import COLORS from "@/app/constants/colors";

export default function CoinBalance({
  coins,
  prevCoins,
  onPress,
}: CoinBalanceProps) {
  const [displayedCoins, setDisplayedCoins] = useState(coins);
  const scale = useSharedValue(1);
  const rotateY = useSharedValue(0);

  // Animate when coin balance changes
  useEffect(() => {
    if (prevCoins !== undefined && prevCoins !== coins) {
      // Bounce animation
      scale.value = withSequence(
        withSpring(1.2, { damping: 4 }),
        withSpring(1, { damping: 8 })
      );

      rotateY.value = withSequence(
        withTiming(180, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        withTiming(0, {
          duration: 400,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      // Smoothly animate the number changing
      animateValue(prevCoins, coins, 800, (value) => {
        setDisplayedCoins(value);
      });
    }
  }, [coins, prevCoins]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedCoinStyle = useAnimatedStyle(() => {
    return {
      transform: [{ perspective: 1000 }, { rotateY: `${rotateY.value}deg` }],
    };
  });

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Animated.View style={animatedCoinStyle}>
          <Image
            source={require("@/assets/images/coin.webp")}
            style={styles.coinIcon}
          />
        </Animated.View>
        <Text style={styles.coinText}>{displayedCoins}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  coinIcon: {
    width: 38,
    height: 28,
    backfaceVisibility: "visible",
  },
  coinText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
});
