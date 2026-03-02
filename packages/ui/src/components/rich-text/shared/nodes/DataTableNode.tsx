import { DecoratorNode, type NodeKey, type SerializedLexicalNode, type Spread } from "lexical";
import type React from "react";
import { DefaultRichTextDataTable } from "../components/default-rich-text-components";
import type { RowData } from "../types/rich-text-components";

export type { RowData } from "../types/rich-text-components";

export class DataTableNode extends DecoratorNode<React.JSX.Element> {
  __data: RowData[];

  static getType() {
    return "data_table";
  }

  static clone(node: DataTableNode) {
    return new DataTableNode(node.__data, node.__key);
  }

  constructor(data: RowData[], key?: NodeKey) {
    super(key);
    this.__data = data;
  }

  getData(): RowData[] {
    return this.__data;
  }

  createDOM(): HTMLElement {
    return document.createElement("div");
  }

  updateDOM(): boolean {
    return false;
  }

  decorate() {
    return <DefaultRichTextDataTable fullWidth isReadOnly data={this.__data} />;
  }

  exportJSON(): SerializedDataTableNode {
    return {
      type: "data_table",
      version: 1,
      data: this.__data,
    };
  }

  static importJSON(json: SerializedDataTableNode) {
    return new DataTableNode(json.data);
  }

  getTextContent(): string {
    // Convert table data to a readable text representation
    if (!this.__data.length) return "";

    const headers = Object.keys(this.__data[0]);
    const headerRow = headers.join(" | ");
    const separator = headers.map(() => "---").join(" | ");
    const dataRows = this.__data.map((row) => headers.map((header) => String(row[header] || "")).join(" | "));

    return [headerRow, separator, ...dataRows].join("\n");
  }
}

export type SerializedDataTableNode = Spread<{ data: RowData[] }, SerializedLexicalNode>;

export function $createDataTableNode(data: RowData[]) {
  return new DataTableNode(data);
}

export function $isDataTableNode(node: unknown): node is DataTableNode {
  return node instanceof DataTableNode;
}
