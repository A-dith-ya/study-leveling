import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { flashcardIds } = ctx.args;

  return {
    operation: "BatchDeleteItem",
    tables: {
      [`Flashcard-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`]:
        flashcardIds.map((flashcardId) =>
          util.dynamodb.toMapValues({
            flashcardId: flashcardId,
          })
        ),
    },
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return true;
}
