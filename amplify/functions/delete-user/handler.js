const AWS = require("aws-sdk");

const dynamodb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
  const userId = event.identity.username;

  const userTable = process.env.USER_TABLE;
  const deckTable = process.env.DECK_TABLE;
  const flashcardTable = process.env.FLASHCARD_TABLE;

  try {
    const decks = await scanTable(deckTable, "userId", userId);
    const deckIds = decks.map((deck) => deck.deckId);

    for (const deckId of deckIds) {
      const flashcards = await scanTable(flashcardTable, "deckId", deckId);
      // Delete flashcards
      await batchDelete(flashcardTable, flashcards, "flashcardId");
    }

    // Delete decks
    await batchDelete(deckTable, decks, "deckId");

    // Delete user
    await dynamodb
      .delete({
        TableName: userTable,
        Key: { userId: userId },
      })
      .promise();

    return true;
  } catch (err) {
    console.error("❌ Error fetching decks:", err);
    throw err;
  }
};

async function scanTable(tableName, filterKey, filterValue) {
  const items = [];
  let lastKey;

  do {
    const params = {
      TableName: tableName,
      ScanFilter: {
        [filterKey]: {
          ComparisonOperator: "EQ",
          AttributeValueList: [filterValue],
        },
      },
      ExclusiveStartKey: lastKey,
    };

    const result = await dynamodb.scan(params).promise();
    items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

async function batchDelete(tableName, items, keyField) {
  if (items.length === 0) return;

  const chunks = [];
  for (let i = 0; i < items.length; i += 25) {
    chunks.push(items.slice(i, i + 25));
  }

  // Process in chunks of 25 (DynamoDB limit)
  for (const chunk of chunks) {
    await dynamodb
      .batchWrite({
        RequestItems: {
          [tableName]: chunk.map((item) => ({
            DeleteRequest: {
              Key: { [keyField]: item[keyField] },
            },
          })),
        },
      })
      .promise();
  }
}
