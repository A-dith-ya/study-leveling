import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuthenticator } from "@aws-amplify/ui-react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import COLORS from "../../constants/colors";

export default function SignInFooter() {
  const { toSignUp } = useAuthenticator();

  return (
    <View style={styles.footer}>
      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Sign Up Link */}
      <View style={{ alignItems: "center" }}>
        <Text style={styles.footerText}>Don't have an account yet?</Text>
        <Pressable
          onPress={toSignUp}
          style={{
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: COLORS.secondary,
            borderRadius: 25,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: COLORS.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="person-add-outline" size={16} color={COLORS.white} />
          <Text
            style={[
              styles.signupLink,
              {
                color: COLORS.white,
                marginLeft: 6,
                textDecorationLine: "none",
                fontWeight: "600",
              },
            ]}
          >
            Create Account
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
