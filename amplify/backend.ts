import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { feedback } from "./functions/feedback/resource";
import { generateFlashcards } from "./functions/generate-flashcards/resource";
import { deleteUser } from "./functions/delete-user/resource";
import { batchCreateFlashcards } from "./functions/batch-create-flashcards/resource";
import { batchUpdateFlashcards } from "./functions/batch-update-flashcards/resource";
import { Effect, PolicyStatement, Policy } from "aws-cdk-lib/aws-iam";
import { Stack } from "aws-cdk-lib";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  feedback,
  generateFlashcards,
  deleteUser,
  batchCreateFlashcards,
  batchUpdateFlashcards,
});

const { cfnUserPool } = backend.auth.resources.cfnResources;

cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 6,
    requireLowercase: false,
    requireUppercase: false,
    requireNumbers: false,
    requireSymbols: false,
  },
};
// Get the Deck table
const userTable = backend.data.resources.tables["User"];
const deckTable = backend.data.resources.tables["Deck"];
const flashcardTable = backend.data.resources.tables["Flashcard"];

// Create IAM policy for both delete user and batch create flashcards
const dynamoDbPolicy = new Policy(Stack.of(deckTable), "DynamoDbAccessPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
      ],
      resources: [
        deckTable.tableArn,
        flashcardTable.tableArn,
        userTable.tableArn,
      ],
    }),
  ],
});

// Attach to Lambda roles
backend.deleteUser.resources.lambda.role?.attachInlinePolicy(dynamoDbPolicy);
backend.batchCreateFlashcards.resources.lambda.role?.attachInlinePolicy(
  dynamoDbPolicy
);
backend.batchUpdateFlashcards.resources.lambda.role?.attachInlinePolicy(
  dynamoDbPolicy
);

// Add environment variables for deleteUser function
backend.deleteUser.addEnvironment("USER_TABLE", userTable.tableName);
backend.deleteUser.addEnvironment("DECK_TABLE", deckTable.tableName);
backend.deleteUser.addEnvironment("FLASHCARD_TABLE", flashcardTable.tableName);

// Add environment variables for batchCreateFlashcards function
backend.batchCreateFlashcards.addEnvironment("DECK_TABLE", deckTable.tableName);
backend.batchCreateFlashcards.addEnvironment(
  "FLASHCARD_TABLE",
  flashcardTable.tableName
);

// Add environment variables for batchUpdateFlashcards function
backend.batchUpdateFlashcards.addEnvironment("DECK_TABLE", deckTable.tableName);
backend.batchUpdateFlashcards.addEnvironment(
  "FLASHCARD_TABLE",
  flashcardTable.tableName
);
