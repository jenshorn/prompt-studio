import { useCommentCommands } from "./hooks/useCommentCommands";
import { useCommentSchema } from "./hooks/useCommentSchema";

export function CommentPlugin(): null {
  useCommentSchema();
  useCommentCommands();
  return null;
}
