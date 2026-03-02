import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

type StateUpdatePluginProps = {
  value: string;
  onUpdate: (value: string) => void;
};

export default function StateUpdatePlugin({ value, onUpdate }: StateUpdatePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.update(() => onUpdate(value), { tag: "history-merge" });
  }, [value, editor, onUpdate]);

  return null;
}
