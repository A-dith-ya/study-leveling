import { defineFunction } from "@aws-amplify/backend";
import { secret } from "@aws-amplify/backend";

export const generateFlashcards = defineFunction({
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    ASSISTANT_ID: secret("ASSISTANT_ID"),
  },
  timeoutSeconds: 30,
});
