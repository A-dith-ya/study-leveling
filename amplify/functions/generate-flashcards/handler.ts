import OpenAI from "openai";
import { Schema } from "../../data/resource";
import { env } from "$amplify/env/generate-flashcards";
import { flashcardInstructions } from "./constants";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const handler: Schema["generateFlashcards"]["functionHandler"] = async (
  event
) => {
  const { notes } = event.arguments;

  try {
    const response = await openai.responses.create({
      model: "gpt-4.1-nano",
      instructions: flashcardInstructions,
      input: notes,
    });

    try {
      const trimmed = response.output_text.trim();
      return JSON.parse(trimmed);
    } catch (fullParseError) {
      console.log("⚠️ Full parse failed:", fullParseError);

      const jsonMatch = response.output_text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (fallbackParseError) {
          console.error("❌ Failed to parse matched JSON:", fallbackParseError);
        }
      }

      console.error("❌ No valid JSON found in assistant message");
    }
  } catch (error) {
    console.error("🚨 Error submitting to AI review:", error);
  }
};
