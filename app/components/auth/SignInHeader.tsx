import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import COLORS from "../../constants/colors";

export default function SignInHeader() {
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
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
        />
        <View style={{ marginLeft: 16 }}>
          <Text style={styles.headerTitle}>Study Leveling</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <Ionicons name="trending-up" size={16} color={COLORS.primary} />
            <Text
              style={{
                fontSize: 14,
                color: COLORS.primary,
                marginLeft: 4,
                fontWeight: "500",
              }}
            >
              Level up your learning
            </Text>
          </View>
        </View>
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
        Sign in to access your personalized study experience
      </Animated.Text>
    </View>
  );
}
