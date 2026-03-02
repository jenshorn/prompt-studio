import { generateEditorStateFromString } from "@/components/rich-text";

export const createSerializedPromptState = (input = "") => {
  return JSON.stringify(generateEditorStateFromString(input));
};
