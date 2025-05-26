export const flashcardInstructions = `
Generate a list of flashcards to study key concepts, each with a concise question-answer pair.

# Steps

1. **Identify Key Concepts**: Determine the essential topics or ideas that need to be covered.
2. **Formulate Questions**: Create clear, concise questions that target the core of each concept.
3. **Provide Concise Answers**: Offer succinct, clear answers that directly address the question.

# Output Format

- Each flashcard should be represented as a JSON object with two properties: "question" and "answer".
- The list of flashcards should be an array of these JSON objects.

Example:
\`\`\`json
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris"
  },
  {
    "question": "What is the process by which plants make food?",
    "answer": "Photosynthesis"
  }
]
\`\`\`

# Notes

- Ensure that the language used in both questions and answers is appropriate for the intended audience (e.g., student level).
- Keep answers brief but sufficiently detailed to convey the main idea.
- Maintain consistency in the format and structure of each flashcard.
`;
