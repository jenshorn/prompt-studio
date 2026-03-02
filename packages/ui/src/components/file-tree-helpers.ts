export type FileTreeItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  meta?: string;
  children?: FileTreeItem[];
};

export const mapFilesById = (nodes: FileTreeItem[]) => {
  const map = new Map<string, FileTreeItem>();

  const visit = (items: FileTreeItem[]) => {
    items.forEach((item) => {
      if (item.type === "file") {
        map.set(item.id, item);
        return;
      }

      if (item.children) {
        visit(item.children);
      }
    });
  };

  visit(nodes);

  return map;
};
