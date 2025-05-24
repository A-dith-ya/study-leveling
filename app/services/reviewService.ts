import { useMutation } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

import { logger } from "@/app/utils/logger";

const client = generateClient<Schema>();

async function submitToAIReview(
  input: Parameters<typeof client.queries.feedback>[0]
): Promise<Schema["FeedbackResponse"]["type"]> {
  try {
    const response = await client.queries.feedback(input);
    if (!response.data) {
      throw new Error("No response from AI review");
    }
    logger.info("submitToAIReview", {
      response: response.data,
    });
    return response.data;
  } catch (error) {
    logger.error("Error submitting to AI review", {
      error,
    });
    throw error;
  }
}

export function useAIReview() {
  return useMutation({
    mutationFn: submitToAIReview,
  });
}
