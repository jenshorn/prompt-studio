import type { TextMatchTransformer } from "@lexical/markdown";
import { $createReferenceLinkNode, $isReferenceLinkNode, ReferenceLinkNode } from "./ReferenceLinkNode";

// Matches {{link('xxx')}} or {{ link("xxx") }}
const LINK_REGEXP = /\{\{\s*link\((['"])([^'"\s]+)\1\)\s*\}\}/;

export const REFERENCE_LINK_TRANSFORMER: TextMatchTransformer = {
  dependencies: [ReferenceLinkNode],
  export: (node) => {
    if ($isReferenceLinkNode(node)) {
      const href = (node as ReferenceLinkNode).__href;
      const label = (node as ReferenceLinkNode).__label ?? href;
      // Export back to token form so markdown roundtrips
      if (label) {
        return `{{link('${label}')}}`;
      }
      return `{{link('${href}')}}`;
    }
    return null;
  },
  regExp: LINK_REGEXP,
  importRegExp: LINK_REGEXP,
  replace: (textNode, match) => {
    const value = match[2];
    // For now we assume value is both label and href; if it looks like a URL, use as href.
    const looksLikeUrl = /^(https?:\/\/|\/)/i.test(value);
    const href = looksLikeUrl ? value : `#${value}`;
    const label = value;
    textNode.replace($createReferenceLinkNode(href, label));
  },
  type: "text-match",
};
