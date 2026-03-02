import { useEffect, useMemo, useState } from "react";
import type { ReferenceMenuOption } from "../ReferenceMenuOption";

const localFilter = (data: ReferenceMenuOption[], q: string) =>
  data.filter((m) => m.name.replace(/ /g, "_").toLowerCase().includes(q.toLowerCase()));

/**
 * Search across all resources and menu options
 *
 * @param queryString
 * @returns
 */
export function useContextLookup(
  queryString: string | null,
  items: {
    resourceId: string;
    resourceType: "table" | "connector";
    name: string;
    description?: string;
  }[] = [],
) {
  const [results, setResults] = useState<Array<ReferenceMenuOption>>([]);

  const baseOptions: ReferenceMenuOption[] = useMemo(
    () =>
      items.map(
        (res, index): ReferenceMenuOption => ({
          id: res.resourceId,
          key: res.resourceId,
          index,
          group: res.resourceType,
          name: res.name,
          description: res.description,
          setRefElement: () => {},
        }),
      ),
    [items],
  );

  useEffect(() => {
    if (queryString == null || queryString === "") {
      setResults(baseOptions);
      return;
    }

    setResults(localFilter(baseOptions, queryString));
  }, [queryString, baseOptions]);

  return results;
}
