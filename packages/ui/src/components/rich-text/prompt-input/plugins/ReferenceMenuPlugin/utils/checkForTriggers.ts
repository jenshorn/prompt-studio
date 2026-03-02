import type { MenuTextMatch } from "@lexical/react/LexicalTypeaheadMenuPlugin";

const VALID_PUNCTUATION = "\\.\\-<>_:";
const TRIGGERS = ["#"].join("");

const VALID_CHARS = `[^${TRIGGERS}${VALID_PUNCTUATION}\\s]`;
const VALID_JOINS = `(?:[${VALID_PUNCTUATION}]|)`;

const LENGTH_LIMIT = 75;

const TriggerRegex = new RegExp(`(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}${VALID_JOINS}){0,${LENGTH_LIMIT}}))$`);

const AliasRegex = new RegExp(`(^|\\s|\\()([${TRIGGERS}]((?:${VALID_CHARS}){0,${LENGTH_LIMIT}}))$`);

/**
 * lexical will run this function on text nodes
 *
 * @param text
 * @param minMatchLength
 * @returns
 */
export function checkForTriggers(text: string, minMatchLength: number): MenuTextMatch | null {
  let match = TriggerRegex.exec(text);

  if (match === null) {
    match = AliasRegex.exec(text);
  }

  if (match !== null) {
    // The strategy ignores leading whitespace but we need to know it's
    // length to add it to the leadOffset
    const maybeLeadingWhitespace = match[1];
    const matchingString = match[3];

    if (matchingString.length >= minMatchLength) {
      return {
        leadOffset: match.index + maybeLeadingWhitespace.length,
        matchingString,
        replaceableString: match[2],
      };
    }
  }

  return null;
}
