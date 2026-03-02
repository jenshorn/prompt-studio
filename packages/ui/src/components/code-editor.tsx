import { DiffEditor, Editor } from "@monaco-editor/react";

export const customTheme = {
  base: "vs-dark" as const,
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#0a0d15",
    "editor.foreground": "#f5f5f5",
    "editor.lineHighlightBackground": "#22252C",
    "editorCursor.foreground": "#A7A7A7",
    "editorWhitespace.foreground": "#3B3B3B",
    "editorIndentGuide.background": "#404040",
    "editorIndentGuide.activeBackground": "#707070",
  },
};

interface CodeEditorProps {
  language: string;
  defaultCode?: string;
  code?: string;
  isEditable: boolean;
  showLineNumbers?: boolean;
  onChange?: (code: string) => void;
  disableScroll?: boolean;
}

export const CodeEditor = (props: CodeEditorProps) => {
  const { defaultCode, code, showLineNumbers, isEditable, language = "javascript", onChange, disableScroll } = props;

  const options = {
    tabSize: 2,
    minimap: {
      enabled: false,
    },
    fontSize: 12,
    readOnly: !isEditable,
    lineNumbers: showLineNumbers ? "on" : "off",
    ...(disableScroll
      ? {
          scrollbar: {
            vertical: "hidden" as const,
            horizontal: "hidden" as const,
            useShadows: false,
            alwaysConsumeMouseWheel: false,
          },
          scrollBeyondLastLine: false,
          mouseWheelScrollSensitivity: 0,
          overviewRulerLanes: 0,
        }
      : {}),
  } as const;

  return (
    <Editor
      width="100%"
      height="100%"
      language={language}
      defaultValue={defaultCode}
      value={code}
      theme={"ps-theme"}
      options={options}
      onChange={(value) => {
        onChange?.(value || "");
      }}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("ps-theme", customTheme);
      }}
      onMount={async (editor, monaco) => {
        monaco.editor.setTheme("ps-theme");

        // Add JSX support
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.React,
        });

        // Format on cmd+s
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
          await editor.getAction("editor.action.formatDocument")?.run();
        });

        // Run format on the initial value
        await editor.getAction("editor.action.formatDocument")?.run();
      }}
    />
  );
};

interface CodeDiffEditorProps {
  language: string;
  original: string;
  modified: string;
  showLineNumbers?: boolean;
  disableScroll?: boolean;
}

export const CodeDiffEditor = (props: CodeDiffEditorProps) => {
  const { original, modified, showLineNumbers, language = "javascript", disableScroll } = props;

  const options = {
    tabSize: 2,
    minimap: {
      enabled: false,
    },
    fontSize: 12,
    readOnly: true,
    originalEditable: false,
    renderSideBySide: true,
    useInlineViewWhenSpaceIsTooSmall: true,
    lineNumbers: showLineNumbers ? "on" : "off",
    ...(disableScroll
      ? {
          scrollbar: {
            vertical: "hidden" as const,
            horizontal: "hidden" as const,
            useShadows: false,
            alwaysConsumeMouseWheel: false,
          },
          scrollBeyondLastLine: false,
          mouseWheelScrollSensitivity: 0,
          overviewRulerLanes: 0,
        }
      : {}),
  } as const;

  return (
    <DiffEditor
      width="100%"
      height="100%"
      language={language}
      original={original}
      modified={modified}
      theme={"ps-theme"}
      options={options}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme("ps-theme", customTheme);
      }}
      onMount={(_, monaco) => {
        monaco.editor.setTheme("ps-theme");

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          jsx: monaco.languages.typescript.JsxEmit.React,
        });
      }}
    />
  );
};
