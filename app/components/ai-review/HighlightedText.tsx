import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolate,
  useSharedValue,
  Extrapolate,
} from "react-native-reanimated";
import COLORS from "../../constants/colors";

interface HighlightedTextProps {
  text: string;
  type: "correct" | "incorrect" | "missing" | "none";
}

export default function HighlightedText({ text, type }: HighlightedTextProps) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {
        translateY: interpolate(
          opacity.value,
          [0, 1],
          [10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.Text
      style={[styles.highlightedText, styles[`${type}Text`], textStyle]}
      selectable={true}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  highlightedText: {
    fontSize: 16,
    lineHeight: 24,
  },
  correctText: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    color: "#4CAF50",
  },
  incorrectText: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
    color: "#F44336",
  },
  missingText: {
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    color: "#FFC107",
  },
  noneText: {
    color: COLORS.text,
  },
});
