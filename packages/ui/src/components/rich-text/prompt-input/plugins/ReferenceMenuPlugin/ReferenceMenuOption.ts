import type { MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";
import type { ResourceType } from "../../../types";

export type MenuOptionGroup = ResourceType;

export interface BaseMenuOption {
  id: string;
  name: string;
  group: MenuOptionGroup;
  description?: string;
}

export interface ReferenceMenuOption extends MenuOption, BaseMenuOption {
  index: number;
}
