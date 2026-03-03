import { Box, IconButton, Menu, Text } from "@chakra-ui/react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  TableCellNode,
} from "@lexical/table";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TableCellActionMenuProps = Readonly<{
  tableCellNode: TableCellNode;
}>;

function TableActionMenuItem(props: { label: string; onSelect: () => void; testId: string }) {
  const { label, onSelect, testId } = props;

  return (
    <Menu.Item value={testId} onSelect={onSelect} data-test-id={testId}>
      <Text lineClamp={1} textStyle="label/M/regular">
        {label}
      </Text>
    </Menu.Item>
  );
}

function TableActionMenu({ tableCellNode: _tableCellNode }: TableCellActionMenuProps) {
  const [editor] = useLexicalComposerContext();
  const [tableCellNode, updateTableCellNode] = useState(_tableCellNode);
  const selectionCounts = { columns: 1, rows: 1 };

  useEffect(() => {
    return editor.registerMutationListener(TableCellNode, (nodeMutations) => {
      const nodeUpdated = nodeMutations.get(tableCellNode.getKey()) === "updated";

      if (nodeUpdated) {
        editor.getEditorState().read(() => {
          updateTableCellNode(tableCellNode.getLatest());
        });
      }
    });
  }, [editor, tableCellNode]);

  const insertTableRowAtSelection = (shouldInsertAfter: boolean) => {
    editor.update(() => {
      $insertTableRowAtSelection(shouldInsertAfter);
    });
  };

  const insertTableColumnAtSelection = (shouldInsertAfter: boolean) => {
    editor.update(() => {
      for (let i = 0; i < selectionCounts.columns; i++) {
        $insertTableColumnAtSelection(shouldInsertAfter);
      }
    });
  };

  const deleteTableRowAtSelection = () => {
    editor.update(() => {
      $deleteTableRowAtSelection();
    });
  };

  const deleteTableColumnAtSelection = () => {
    editor.update(() => {
      $deleteTableColumnAtSelection();
    });
  };

  return createPortal(
    <Menu.Content>
      <TableActionMenuItem
        label={`Insert ${selectionCounts.rows === 1 ? "row" : `${selectionCounts.rows} rows`} above`}
        onSelect={() => insertTableRowAtSelection(false)}
        testId="table-insert-row-above"
      />
      <TableActionMenuItem
        label={`Insert ${selectionCounts.rows === 1 ? "row" : `${selectionCounts.rows} rows`} below`}
        onSelect={() => insertTableRowAtSelection(true)}
        testId="table-insert-row-below"
      />
      <Menu.Separator />
      <TableActionMenuItem
        label={`Insert ${selectionCounts.columns === 1 ? "column" : `${selectionCounts.columns} columns`} left`}
        onSelect={() => insertTableColumnAtSelection(false)}
        testId="table-insert-column-before"
      />
      <TableActionMenuItem
        label={`Insert ${selectionCounts.columns === 1 ? "column" : `${selectionCounts.columns} columns`} right`}
        onSelect={() => insertTableColumnAtSelection(true)}
        testId="table-insert-column-after"
      />
      <Menu.Separator />
      <TableActionMenuItem
        label="Delete column"
        onSelect={() => deleteTableColumnAtSelection()}
        testId="table-delete-columns"
      />
      <TableActionMenuItem label="Delete row" onSelect={() => deleteTableRowAtSelection()} testId="table-delete-rows" />
    </Menu.Content>,
    document.body,
  );
}

function TableCellActionMenuContainer({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor] = useLexicalComposerContext();

  const menuButtonRef = useRef(null);

  const [tableCellNode, setTableMenuCellNode] = useState<TableCellNode | null>(null);

  const moveMenu = () => {
    const menu = menuButtonRef.current;
    const selection = $getSelection();
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (selection == null || menu == null) {
      setTableMenuCellNode(null);
      return;
    }

    const rootElement = editor.getRootElement();

    if (
      $isRangeSelection(selection) &&
      rootElement !== null &&
      nativeSelection !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(selection.anchor.getNode());

      if (tableCellNodeFromSelection == null) {
        setTableMenuCellNode(null);
        return;
      }

      const tableCellParentNodeDOM = editor.getElementByKey(tableCellNodeFromSelection.getKey());

      if (tableCellParentNodeDOM == null) {
        setTableMenuCellNode(null);
        return;
      }

      setTableMenuCellNode(tableCellNodeFromSelection);
    } else if (!activeElement) {
      setTableMenuCellNode(null);
    }
  };

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      editor.getEditorState().read(() => {
        moveMenu();
      });
    });
  });

  useEffect(() => {
    const menuButtonDOM = menuButtonRef.current as HTMLButtonElement | null;

    if (menuButtonDOM != null && tableCellNode != null) {
      const tableCellNodeDOM = editor.getElementByKey(tableCellNode.getKey());

      if (tableCellNodeDOM != null) {
        const tableCellRect = tableCellNodeDOM.getBoundingClientRect();
        const menuRect = menuButtonDOM.getBoundingClientRect();
        const anchorRect = anchorElem.getBoundingClientRect();

        const top = tableCellRect.top - anchorRect.top + 7;
        const left = tableCellRect.right - menuRect.width - 10 - anchorRect.left;

        menuButtonDOM.style.opacity = "1";
        menuButtonDOM.style.transform = `translate(${left}px, ${top}px)`;
      } else {
        menuButtonDOM.style.opacity = "0";
        menuButtonDOM.style.transform = "translate(-10000px, -10000px)";
      }
    }
  }, [tableCellNode, editor, anchorElem]);

  const prevTableCellDOM = useRef(tableCellNode);

  useEffect(() => {
    if (prevTableCellDOM.current !== tableCellNode) {
      // close menu
    }

    prevTableCellDOM.current = tableCellNode;
  }, [tableCellNode]);

  return (
    <Box position="absolute" top={0} left={0} willChange="transform" ref={menuButtonRef}>
      {tableCellNode != null && (
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton size="xs" aria-label="Open table cell action menu">
              <Text fontSize="xs" lineHeight="1">
                ...
              </Text>
            </IconButton>
          </Menu.Trigger>
          <Menu.Positioner>
            <TableActionMenu tableCellNode={tableCellNode} />
          </Menu.Positioner>
        </Menu.Root>
      )}
    </Box>
  );
}

interface TableCellActionMenuContainerProps {
  anchorElem?: HTMLElement;
}

export function TableCellActionMenuPlugin({ anchorElem = document.body }: TableCellActionMenuContainerProps) {
  const isEditable = useLexicalEditable();
  return createPortal(isEditable ? <TableCellActionMenuContainer anchorElem={anchorElem} /> : null, anchorElem);
}
