import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import COLORS from "@/app/constants/colors";
import { EditHeaderProps } from "@/app/types/stickerTypes";

export default function EditHeader({
  title,
  rightButtonText,
  rightButtonIcon,
  onRightButtonPress,
  showBackButton = true,
  backButtonDestination = "/(amain)",
}: EditHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {showBackButton && (
          <Pressable
            style={styles.backButton}
            onPress={() => router.dismissTo(backButtonDestination)}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable
        onPress={onRightButtonPress}
        style={styles.rightButton}
        accessibilityRole="button"
      >
        <Ionicons name={rightButtonIcon} size={24} color={COLORS.primary} />
        <Text style={styles.rightButtonText}>{rightButtonText}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  rightButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  rightButtonText: {
    marginLeft: 4,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
  },
});
