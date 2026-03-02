import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $createParagraphNode } from "lexical";
import { useEffect } from "react";
import { CommentNode } from "../nodes/CommentNode/CommentNode";

export const useCommentSchema = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerNodeTransform(CommentNode, (node) => {
        const children = node.getChildren();

        /**
         * Comment nodes cannot have other comments as children
         */
        const invalidChildren = children.filter((child) => child.getType() === "comment");

        if (invalidChildren.length > 0) {
          editor.update(() => {
            invalidChildren.forEach((child) => {
              child.replace($createParagraphNode(), true);
            });
          });
        }
      }),
    );
  }, [editor]);
};
