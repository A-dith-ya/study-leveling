import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { postConfirmation } from "../auth/post-confirmation/resource";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any unauthenticated user can "create", "read", "update", 
and "delete" any "Todo" records.
=========================================================================*/
const schema = a
  .schema({
    // createdAt, updatedAt automatically included by a.model()
    User: a
      .model({
        userId: a.id().required(),
        email: a.string().required(),
        xp: a.integer().default(0),
        level: a.integer().default(1),
        streak: a.integer().default(0),
        avatar: a.string(),
        ownedCosmetics: a.string().array(), // Array of cosmetic IDs
        unlockedAchievements: a.string().array(),
        levelRewards: a.string().array(),
        decks: a.hasMany("Deck", "userId"), // One-to-many relationship: one user can have many decks
      })
      .identifier(["userId"])
      .authorization((allow) => [allow.owner(), allow.authenticated()]), // Only the owner can access the User model

    Deck: a
      .model({
        deckId: a.id().required(),
        title: a.string().required(),
        decorations: a.json(), // Storing decorations as JSON: { stickerId: { x, y, scale } }[]
        userId: a.id().required(),
        user: a.belongsTo("User", "userId"), // Many-to-one relationship: many decks can belong to one user
        flashcards: a.hasMany("Flashcard", "deckId"), // One-to-many relationship: one deck can have many flashcards
      })
      .identifier(["deckId"])
      .authorization((allow) => [allow.owner()]),

    Flashcard: a
      .model({
        flashcardId: a.id().required(),
        front: a.string().required(),
        back: a.string().required(),
        deckId: a.id().required(),
        deck: a.belongsTo("Deck", "deckId"), // Many-to-one relationship: many flashcards can belong to one deck
      })
      .identifier(["flashcardId"])
      .authorization((allow) => [allow.owner()]),
  })
  .authorization((allow) => [allow.resource(postConfirmation)]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
