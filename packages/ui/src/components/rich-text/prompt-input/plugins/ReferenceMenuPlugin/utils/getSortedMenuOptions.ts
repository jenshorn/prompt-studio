import { menuSortOrder } from "../constants";
import type { MenuOptionGroup, ReferenceMenuOption } from "../ReferenceMenuOption";

export const getSortedMenuOptions = (options: ReferenceMenuOption[]) => {
  const sortedOptions = options
    .sort((a, b) => menuSortOrder.indexOf(a.group) - menuSortOrder.indexOf(b.group))
    .map((option, index) => ({ ...option, index }) as ReferenceMenuOption);

  const groupedOptions = sortedOptions.reduce(
    (acc, option) => {
      const bucket = acc[option.group] ?? [];
      bucket.push(option);
      acc[option.group] = bucket;
      return acc;
    },
    {} as Record<MenuOptionGroup, ReferenceMenuOption[]>,
  );

  return groupedOptions;
};
