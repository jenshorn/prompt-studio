export type SidebarItem = {
  text: string;
  link?: string;
  items?: SidebarItem[];
};

export type DocsConfig = {
  sidebar: SidebarItem[];
};

export type DocRow = {
  item: SidebarItem;
  depth: number;
  hasChildren: boolean;
};
