const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const { deckId, title, userId, flashcards, deletedFlashcardIds } =
    event.arguments;

  const deckTable = process.env.DECK_TABLE;
  const flashcardTable = process.env.FLASHCARD_TABLE;

  try {
    const now = new Date().toISOString();

    // Update the deck metadata
    await dynamodb
      .update({
        TableName: deckTable,
        Key: { deckId },
        UpdateExpression:
          "SET title = :title, flashcardCount = :count, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":title": title,
          ":count": flashcards ? flashcards.length : 0,
          ":updatedAt": now,
        },
      })
      .promise();

    // Delete flashcards if any exist to be deleted
    if (deletedFlashcardIds && deletedFlashcardIds.length > 0) {
      // Process deletions in chunks of 25
      const deleteChunks = [];
      for (let i = 0; i < deletedFlashcardIds.length; i += 25) {
        deleteChunks.push(deletedFlashcardIds.slice(i, i + 25));
      }

      for (const chunk of deleteChunks) {
        const deleteRequests = chunk.map((flashcardId) => ({
          DeleteRequest: {
            Key: { flashcardId },
          },
        }));

        await dynamodb
          .batchWrite({
            RequestItems: {
              [flashcardTable]: deleteRequests,
            },
          })
          .promise();
      }
    }

    // Create/update flashcards if any exist
    if (!flashcards || flashcards.length === 0) {
      return true;
    }

    // Prepare items for batch write (these will be new or updated flashcards)
    const putRequests = flashcards.map((flashcard) => ({
      PutRequest: {
        Item: {
          flashcardId: flashcard.flashcardId,
          front: flashcard.front,
          back: flashcard.back,
          order: flashcard.order,
          deckId: deckId,
          createdAt: now, // For new cards
          updatedAt: now,
          owner: userId,
          __typename: "Flashcard",
        },
      },
    }));

    // Process in chunks of 25 (DynamoDB batch write limit)
    const putChunks = [];
    for (let i = 0; i < putRequests.length; i += 25) {
      putChunks.push(putRequests.slice(i, i + 25));
    }

    for (const chunk of putChunks) {
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
    console.error("❌ Error updating deck and flashcards:", error);
    throw error;
  }
};
