import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useImperativeHandle } from "react";
import { generateEditorStateFromString, getTextFromSerializedEditorState } from "../utils";

export interface PromptEditorRef {
  setEditorValue: (value: string) => void;
}

export function ImperativeAPIPlugin({
  editorRef,
  previousTextRef,
}: {
  editorRef: React.ForwardedRef<PromptEditorRef>;
  previousTextRef: React.MutableRefObject<string>;
}) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    editorRef,
    () => ({
      setEditorValue: (value: string) => {
        const state = editor.parseEditorState(JSON.stringify(generateEditorStateFromString(value)));
        editor.setEditorState(state);
        previousTextRef.current = getTextFromSerializedEditorState(value);
        editor.focus(undefined, { defaultSelection: "rootEnd" });
      },
    }),
    [editor, previousTextRef],
  );

  return null;
}
