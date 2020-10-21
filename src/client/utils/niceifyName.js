import { capitalCase } from "capital-case";
import { sentenceCase } from "sentence-case";

// Replace some common patterns with nicer capitalization
const patterns = [
  // "User Id" -> "User ID"
  [/\bid\b/gi, "ID"],
  // "Utc" -> "UTC"
  [/\butc\b/gi, "UTC"],
  // Only consonants... "Wp" -> "WP", "Gmt" -> "GMT"
  [/\b[zxcvbnmsdfghjklqwrtp]+\b/gi, (text) => text.toUpperCase()],
];

export default function niceifyName(string) {
  const name = capitalCase(sentenceCase(string));
  return patterns.reduce((name, [find, replace]) => {
    return name.replace(find, replace);
  }, name);
}
