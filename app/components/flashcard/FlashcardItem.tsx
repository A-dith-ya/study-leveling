import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import COLORS from "@/app/constants/colors";
import { FlashcardItemProps } from "@/app/types/flashcardTypes";

export default function FlashcardItem({
  front,
  back,
  onChangeFront,
  onChangeBack,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst = false,
  isLast = false,
}: FlashcardItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={front}
          onChangeText={onChangeFront}
          placeholder="Title"
          placeholderTextColor={COLORS.darkGray}
          multiline
        />
        <TextInput
          style={styles.input}
          value={back}
          onChangeText={onChangeBack}
          placeholder="Description or Answer"
          placeholderTextColor={COLORS.darkGray}
          multiline
        />
      </View>

      <View style={styles.controls}>
        <View style={styles.orderControls}>
          <Pressable
            onPress={onMoveUp}
            style={[styles.iconButton, isFirst && styles.disabledButton]}
            disabled={isFirst}
          >
            <FontAwesome6
              name="chevron-up"
              size={24}
              color={isFirst ? COLORS.disabledButton : COLORS.primary}
            />
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            style={[styles.iconButton, isLast && styles.disabledButton]}
            disabled={isLast}
          >
            <FontAwesome6
              name="chevron-down"
              size={24}
              color={isLast ? COLORS.disabledButton : COLORS.primary}
            />
          </Pressable>
        </View>

        <Pressable onPress={onDelete} style={styles.iconButton}>
          <FontAwesome6 name="trash" size={24} color={COLORS.error} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 16,
    flexDirection: "row",
    shadowColor: COLORS.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flex: 1,
    marginRight: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    color: COLORS.text,
    minHeight: 40,
  },
  controls: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderControls: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    padding: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
