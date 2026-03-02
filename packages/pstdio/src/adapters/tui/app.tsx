import { Box, Text, useApp, useInput } from "ink";
import { useState } from "react";

import type { DocRow } from "@/features/docs/types";
import { InputBar } from "./components/input-bar";
import { StatusBar } from "./components/status-bar";
import { useDocs } from "./hooks/use-docs";
import { useSelection } from "./hooks/use-selection";
import { useTerminalSize } from "./hooks/use-terminal-size";
import { DocsList } from "./panels/docs-list";
import { HelpModal } from "./panels/help-modal";
import { MarkdownView } from "./panels/markdown-view";

export type Mode = "normal" | "search" | "help" | "view";

const HEADER_LINES = 2;
const FOOTER_LINES = 2;
const INPUT_LINES = 1;

export function App() {
  const { exit } = useApp();
  const { columns, rows: termRows } = useTerminalSize();
  const docs = useDocs();

  const [mode, setMode] = useState<Mode>("normal");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewContent, setViewContent] = useState({ title: "", content: "" });

  const inputActive = mode === "search";
  const chrome = HEADER_LINES + FOOTER_LINES + (inputActive ? INPUT_LINES : 0);
  const viewportHeight = Math.max(1, termRows - chrome);

  const allRows = docs.getRows(expanded);

  const rows: DocRow[] = searchQuery
    ? allRows.filter((r) => r.item.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : allRows;

  const { selectedIndex, scrollOffset, moveTo, resetSelection } = useSelection(rows.length, viewportHeight);
  const selectedRow = rows[selectedIndex];

  const toggleExpand = () => {
    if (!selectedRow) return;

    if (selectedRow.hasChildren) {
      setExpanded((prev) => {
        const next = new Set(prev);

        if (next.has(selectedRow.item.text)) {
          next.delete(selectedRow.item.text);
        } else {
          next.add(selectedRow.item.text);
        }

        return next;
      });
      return;
    }

    if (selectedRow.item.link) {
      const content = docs.getDocument(selectedRow.item.link);
      setViewContent({ title: selectedRow.item.text, content: content ?? "" });
      setMode("view");
    }
  };

  const handleSearchSubmit = (value: string) => {
    setSearchQuery(value);
    resetSelection();
    setMode("normal");
    setInputValue("");
  };

  useInput((input, key) => {
    if (mode === "help") {
      if (input === "?" || key.escape) {
        setMode("normal");
      }

      return;
    }

    if (mode === "view") {
      if (input === "v" || key.escape) {
        setMode("normal");
      }

      return;
    }

    if (mode === "search") {
      if (key.escape) {
        setSearchQuery("");
        resetSelection();
        setMode("normal");
        setInputValue("");
      }

      return;
    }

    if (input === "q") {
      exit();
      return;
    }

    if (input === "j" || key.downArrow) {
      moveTo(selectedIndex + 1);
      return;
    }

    if (input === "k" || key.upArrow) {
      moveTo(selectedIndex - 1);
      return;
    }

    if (input === "g") {
      moveTo(0);
      return;
    }

    if (input === "G") {
      moveTo(rows.length - 1);
      return;
    }

    if (key.return) {
      toggleExpand();
      return;
    }

    if (input === "/") {
      setMode("search");
      setInputValue("");
      return;
    }

    if (input === "?") {
      setMode("help");
      return;
    }

    if (input === "v" && selectedRow?.item.link) {
      const content = docs.getDocument(selectedRow.item.link);
      setViewContent({ title: selectedRow.item.text, content: content ?? "" });
      setMode("view");
    }
  });

  const separator = "─".repeat(columns);

  return (
    <Box flexDirection="column" width={columns} height={termRows}>
      <Box>
        <Text bold color="cyan">
          {" pstdio "}
        </Text>

        <Text dimColor>│</Text>

        <Text> {rows.length} docs</Text>

        {searchQuery && (
          <Text>
            <Text dimColor> │ filter: </Text>
            <Text color="yellow">{searchQuery}</Text>
          </Text>
        )}
      </Box>

      <Text dimColor>{separator}</Text>

      {mode === "help" ? (
        <HelpModal width={columns} viewportHeight={viewportHeight} />
      ) : mode === "view" ? (
        <MarkdownView
          title={viewContent.title}
          content={viewContent.content}
          width={columns}
          viewportHeight={viewportHeight}
        />
      ) : (
        <DocsList
          rows={rows}
          selectedIndex={selectedIndex}
          expanded={expanded}
          viewportHeight={viewportHeight}
          scrollOffset={scrollOffset}
          width={columns}
        />
      )}

      {inputActive && (
        <InputBar label="Search" value={inputValue} onChange={setInputValue} onSubmit={handleSearchSubmit} />
      )}

      <StatusBar mode={mode} docCount={rows.length} error={docs.error} width={columns} />
    </Box>
  );
}
