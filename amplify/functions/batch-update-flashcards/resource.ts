import { defineFunction } from "@aws-amplify/backend";

export const batchUpdateFlashcards = defineFunction({
  resourceGroupName: "data",
  name: "batchUpdateFlashcards",
  entry: "./handler.js",
  timeoutSeconds: 30,
});
