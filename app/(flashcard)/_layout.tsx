import { Stack } from "expo-router";

export default function FlashcardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="EditFlashcard" />
      <Stack.Screen name="FlashcardReview" />
      <Stack.Screen name="FlashcardReward" />
    </Stack>
  );
}
