import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import COLORS from "../../constants/colors";

export default function SignUpHeader() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.SignInHeader}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View
          style={{
            backgroundColor: COLORS.secondary,
            borderRadius: 20,
            padding: 16,
            shadowColor: COLORS.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <Ionicons name="person-add" size={32} color={COLORS.white} />
        </View>
        <Text style={[styles.headerTitle, { marginLeft: 16 }]}>
          Create Account
        </Text>
      </Animated.View>

      <Animated.Text
        style={[
          styles.headerSubtitle,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        Create your account to unlock achievements, track progress, and level up
        your knowledge
      </Animated.Text>
    </View>
  );
}
