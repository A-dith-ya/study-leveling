import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { feedback } from "./functions/feedback/resource";
import { generateFlashcards } from "./functions/generate-flashcards/resource";
import { deleteUser } from "./functions/delete-user/resource";
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

// Create IAM policy
const scanPolicy = new Policy(Stack.of(deckTable), "DeleteUserScanPolicy", {
  statements: [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "dynamodb:Scan",
        "dynamodb:BatchWriteItem",
        "dynamodb:DeleteItem",
      ],
      resources: [
        deckTable.tableArn,
        flashcardTable.tableArn,
        userTable.tableArn,
      ],
    }),
  ],
});

// Attach to Lambda role
backend.deleteUser.resources.lambda.role?.attachInlinePolicy(scanPolicy);
backend.deleteUser.addEnvironment("USER_TABLE", userTable.tableName);
backend.deleteUser.addEnvironment("DECK_TABLE", deckTable.tableName);
backend.deleteUser.addEnvironment("FLASHCARD_TABLE", flashcardTable.tableName);
