import { capitalCase } from "capital-case";
import { sentenceCase } from "sentence-case";

// Do you have a suggestion/request for a new pattern?
// It can definitely be considered! File an issue:
// https://github.com/codeclown/helppo/issues

// Replace some common patterns with nicer capitalization
const patterns: [RegExp, string | ((text: string) => string)][] = [
  // "User Id" -> "User ID"
  [/\bid\b/gi, "ID"],
  // "Utc" -> "UTC"
  [/\butc\b/gi, "UTC"],
  [/\bapi\b/gi, "API"],
  [/\bab\b/gi, "AB"],
  // Only consonants... "Wp" -> "WP", "Gmt" -> "GMT"
  [/\b[zxcvbnmsdfghjklqwrtp]+\b/gi, (text) => text.toUpperCase()],
];

export default function niceifyName(text: string): string {
  const name = capitalCase(sentenceCase(text));
  return patterns.reduce((name, [find, replace]) => {
    // TypeScript can't figure out overload without separating these
    if (typeof replace === "string") {
      return name.replace(find, replace);
    }
    return name.replace(find, replace);
  }, name);
}
