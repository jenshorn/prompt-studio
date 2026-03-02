import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_HIGH, KEY_DOWN_COMMAND } from "lexical";
import { useEffect } from "react";
import { shouldSubmitOnEnter } from "./keyboard-shortcuts";

export interface KeyboardShortcutPluginProps {
  onSubmit?: () => void;
}

export function KeyboardShortcutPlugin({ onSubmit }: KeyboardShortcutPluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        if (shouldSubmitOnEnter(event)) {
          event.preventDefault();
          onSubmit?.();
          return true;
        }

        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor, onSubmit]);

  return null;
}
