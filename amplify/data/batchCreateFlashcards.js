import { util } from "@aws-appsync/utils";

export function request(ctx) {
  const { deckId, flashcards } = ctx.args;
  const now = util.time.nowISO8601();

  return {
    operation: "BatchPutItem",
    tables: {
      // For now the dynamodb batch write permissions is not there for resolver
      //   [`Deck-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`]:
      //     [
      //       util.dynamodb.toMapValues({
      //         deckId,
      //         title,
      //         userId,
      //         flashcardCount: flashcards.length,
      //         createdAt: now,
      //         updatedAt: now,
      //       }),
      //     ],
      [`Flashcard-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`]:
        flashcards.map((flashcard, index) =>
          util.dynamodb.toMapValues({
            flashcardId: flashcard.flashcardId,
            front: flashcard.front,
            back: flashcard.back,
            order: flashcard.order,
            deckId,
            createdAt: now,
            updatedAt: now,
            owner: ctx.identity.username,
            __typename: "Flashcard",
          })
        ),
    },
  };
}

export function response(ctx) {
  const flashcardTable = `Flashcard-${ctx.stash.awsAppsyncApiId}-${ctx.stash.amplifyApiEnvironmentName}`;

  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // return ctx.result.data[flashcardTable];
  return true;
}
