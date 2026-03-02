import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, type TextNode } from "lexical";
import { useEffect } from "react";
import { INSERT_BLOCK_COMMAND } from "../../../commands";
import { $createCommentNode } from "../nodes/CommentNode/CommentNode";

export const insertCommentBlock = (_blockType: string, nodeToReplace?: TextNode) => {
  const selection = $getSelection();
  const commentNode = $createCommentNode();

  if (nodeToReplace) {
    const nodeParent = nodeToReplace.getParent();
    nodeParent?.replace(commentNode, true);
    nodeToReplace.remove();
    commentNode.selectEnd();
    return;
  }

  if ($isRangeSelection(selection)) {
    $setBlocksType(selection, $createCommentNode);
  }
};

type InsertBlockEvent = {
  optionId: string;
  nodeToReplace?: TextNode;
};

export function useCommentCommands(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_BLOCK_COMMAND,
        (event: InsertBlockEvent) => {
          const { optionId, nodeToReplace } = event;
          insertCommentBlock(optionId, nodeToReplace);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor]);

  return null;
}
