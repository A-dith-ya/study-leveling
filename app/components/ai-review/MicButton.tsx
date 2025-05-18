import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import COLORS from "../../constants/colors";

export default function MicButton() {
  const [isRecording, setIsRecording] = useState(false);
  const micScale = useSharedValue(1);
  const micGlow = useSharedValue(0);

  const handleMicPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(!isRecording);

    if (!isRecording) {
      micScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 2 }),
          withSpring(1, { damping: 2 })
        ),
        -1,
        true
      );
      micGlow.value = withRepeat(
        withSequence(
          withSpring(0.8, { damping: 2 }),
          withSpring(0.2, { damping: 2 })
        ),
        -1,
        true
      );
    } else {
      micScale.value = withSpring(1);
      micGlow.value = withSpring(0);
    }
  };

  const micAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micScale.value }],
    shadowOpacity: micGlow.value,
  }));

  return (
    <Animated.View
      style={[styles.shadow, { shadowColor: COLORS.primary }, micAnimatedStyle]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: isRecording ? COLORS.secondary : COLORS.primary,
          },
        ]}
        onPress={handleMicPress}
      >
        <Ionicons
          name={isRecording ? "mic" : "mic-outline"}
          size={30}
          color={COLORS.white}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
});
