import { defineFunction } from "@aws-amplify/backend";

export const batchCreateFlashcards = defineFunction({
  resourceGroupName: "data",
  name: "batchCreateFlashcards",
  entry: "./handler.js",
  timeoutSeconds: 30,
});
