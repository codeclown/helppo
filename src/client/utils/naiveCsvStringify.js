const needsQuotes = /"|\n/g;

const prepareCsvValue = (value) => {
  if (needsQuotes.test(value)) {
    const encoded = value.replace(needsQuotes, (match) => {
      if (match === "\n") {
        return "\\n";
      }
      if (match === '"') {
        return '\\"';
      }
      return match;
    });
    return `"${encoded}"`;
  }
  return value;
};

export default function naiveCsvStringify(items) {
  return items
    .map((row) => row.map((value) => prepareCsvValue(value)).join(","))
    .join("\n");
}
