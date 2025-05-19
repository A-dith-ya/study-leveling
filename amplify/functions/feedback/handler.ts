import OpenAI from "openai";
import { Schema } from "../../data/resource";
import { env } from "$amplify/env/feedback";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const ASSISTANT_ID = env.ASSISTANT_ID;

export const handler: Schema["feedback"]["functionHandler"] = async (event) => {
  const { question, correctAnswer, userAnswer } = event.arguments;

  try {
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);

    const thread = await openai.beta.threads.create();

    const message = await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: `question: ${question} correctAnswer: ${correctAnswer} userAnswer: ${userAnswer}`,
    });

    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    if (run.status === "completed") {
      const messages = await openai.beta.threads.messages.list(run.thread_id);
      const assistantMessage = messages.data.find(
        (message) => message.role === "assistant"
      );

      if (assistantMessage) {
        const textContent = assistantMessage.content.find(
          (content) => content.type === "text"
        );
        if (textContent?.type === "text") {
          const jsonMatch = textContent.text.value.match(/\{[\s\S]*\}/);

          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          } else {
            console.error("No JSON found in assistant message");
          }
        }
      } else {
        console.error("No assistant message found");
      }
    } else {
      console.error("Run status: ", run.status);
    }
  } catch (error) {
    console.error("Error submitting to AI review: ", error);
  }
};
