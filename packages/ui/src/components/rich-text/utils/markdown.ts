const FRONTMATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/;

export function splitFrontmatter(content: string) {
  const match = content.match(FRONTMATTER_PATTERN);
  if (!match) {
    return { frontmatter: "", body: content };
  }
  return {
    frontmatter: match[0],
    body: content.slice(match[0].length),
  };
}
