import { defineFunction } from "@aws-amplify/backend";

export const deleteUser = defineFunction({
  resourceGroupName: "data",
  entry: "./handler.js",
  timeoutSeconds: 10,
});
