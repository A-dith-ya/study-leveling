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
import COLORS from "@/app/constants/colors";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { MicButtonProps } from "@/app/types/reviewTypes";

export default function MicButton({ onTranscriptChange }: MicButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const micScale = useSharedValue(1);
  const micGlow = useSharedValue(0);

  useSpeechRecognitionEvent("start", () => {
    setIsRecording(true);
    console.log("Speech recognition started");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    micScale.value = withSpring(1);
    micGlow.value = withSpring(0);
    console.log("Speech recognition ended");
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript;
    if (transcript) {
      onTranscriptChange(transcript);
      console.log("Transcript received:", transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log(
      "Speech recognition error:",
      event.error,
      "message:",
      event.message
    );
    setIsRecording(false);
    micScale.value = withSpring(1);
    micGlow.value = withSpring(0);
  });

  const handleMicPress = async () => {
    if (!isRecording) {
      // Start recording
      try {
        const result =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!result.granted) {
          console.warn("Permissions not granted", result);
          return;
        }

        // Start speech recognition
        ExpoSpeechRecognitionModule.start({
          lang: "en-US",
          interimResults: true,
          continuous: false,
        });

        // Start animations
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
      } catch (error) {
        console.error("Error starting speech recognition:", error);
      }
    } else {
      // Stop recording
      ExpoSpeechRecognitionModule.stop();
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
