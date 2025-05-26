const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const { deckId, title, userId, flashcards } = event.arguments;

  const deckTable = process.env.DECK_TABLE;
  const flashcardTable = process.env.FLASHCARD_TABLE;

  try {
    const now = new Date().toISOString();

    // Create the deck first
    await dynamodb
      .put({
        TableName: deckTable,
        Item: {
          deckId,
          title,
          userId,
          flashcardCount: flashcards ? flashcards.length : 0,
          createdAt: now,
          updatedAt: now,
          owner: userId,
          __typename: "Deck",
        },
      })
      .promise();

    // Create flashcards if any exist
    if (!flashcards || flashcards.length === 0) {
      return true;
    }

    // Prepare items for batch write
    const putRequests = flashcards.map((flashcard) => ({
      PutRequest: {
        Item: {
          flashcardId: flashcard.flashcardId,
          front: flashcard.front,
          back: flashcard.back,
          order: flashcard.order,
          deckId: deckId,
          createdAt: now,
          updatedAt: now,
          owner: userId,
          __typename: "Flashcard",
        },
      },
    }));

    // Process in chunks of 25 (DynamoDB batch write limit)
    const chunks = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      chunks.push(putRequests.slice(i, i + 25));
    }

    for (const chunk of chunks) {
      await dynamodb
        .batchWrite({
          RequestItems: {
            [flashcardTable]: chunk,
          },
        })
        .promise();
    }

    return true;
  } catch (error) {
    console.error("❌ Error creating deck and flashcards:", error);
    throw error;
  }
};
