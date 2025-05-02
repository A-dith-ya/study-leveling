import { defineFunction } from "@aws-amplify/backend";

export const preSignUp = defineFunction({
  name: "pre-sign-up", // Defaults to the directory name
  entry: "./handler.ts", // Defaults to "./handler.ts" in the same directory
});
