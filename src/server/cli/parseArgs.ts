export function parseArgs(
  argv: string[],
  options?: {
    aliases?: { [key: string]: string | string[] };
    booleans?: string[];
  }
): { options: { [key: string]: boolean | string }; args: string[] } {
  options = Object.assign(
    {
      aliases: {},
      booleans: [],
    },
    options
  );
  const aliasMap: { [alias: string]: string } = Object.keys(
    options.aliases
  ).reduce((obj, optionKey) => {
    const value = options.aliases[optionKey];
    const aliasesForKey: string[] = typeof value === "string" ? [value] : value;
    for (const item of aliasesForKey) {
      obj[item] = optionKey;
    }
    return obj;
  }, {});
  const parsed = {
    options: {},
    args: [],
  };
  let captureNext;
  for (const arg of argv) {
    if (captureNext) {
      parsed.options[captureNext] = arg;
      captureNext = undefined;
      continue;
    }
    if (arg.startsWith("-")) {
      const cut = arg.startsWith("--") ? 2 : 1;
      const key = arg.slice(cut);
      const realKey = aliasMap[key] || key;
      if (options.booleans.includes(realKey)) {
        parsed.options[realKey] = true;
      } else {
        captureNext = realKey;
      }
      continue;
    }
    parsed.args.push(arg);
  }
  if (captureNext) {
    parsed.options[captureNext] = "";
  }
  return parsed;
}
