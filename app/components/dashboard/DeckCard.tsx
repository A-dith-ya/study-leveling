import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import COLORS from "../../constants/colors";

interface DeckCardProps {
  title: string;
  cardCount: number;
  onEdit: () => void;
  onPractice: () => void;
  onAIReview: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({
  title,
  cardCount,
  onEdit,
  onPractice,
  onAIReview,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.cardCountContainer}>
          <FontAwesome6
            name="credit-card"
            size={16}
            color={COLORS.text}
            style={styles.cardCountIcon}
          />
          <Text style={styles.cardCount}>{cardCount} cards</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
          >
            <FontAwesome6 name="pen" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.practiceButton]}
            onPress={onAIReview}
          >
            <FontAwesome6 name="robot" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.practiceButton]}
            onPress={onPractice}
          >
            <FontAwesome6 name="play" size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    padding: 12,
    marginHorizontal: 16,
    borderColor: COLORS.black,
    borderWidth: 0.2,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardCountIcon: {
    transform: [{ rotate: "90deg" }],
  },
  cardCount: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: COLORS.primaryLight,
  },
  practiceButton: {
    backgroundColor: COLORS.primaryDark,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default DeckCard;
