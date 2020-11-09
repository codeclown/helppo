/**
 *
 * @example parseArgs(process.argv.slice(2))
 * @example parseArgs(['--check', '-o', 'file.txt'], { booleans: ['check'] })
 * @example parseArgs(process.argv.slice(2), { aliases: { file: 'f' } })
 * @example parseArgs(process.argv.slice(2), { aliases: { file: ['f'] } })
 * @param {string[]} argv
 * @param {undefined|{ aliases: { [key]: string|string[] }, booleans: string[] }} options
 * @returns {{ options: { [key]: boolean|string }, args: string[] }}
 */
export function parseArgs(argv, options) {
  options = Object.assign(
    {
      aliases: {},
      booleans: [],
    },
    options
  );
  const aliasMap = Object.keys(options.aliases).reduce((obj, optionKey) => {
    const aliasesForKey = Array.isArray(options.aliases[optionKey])
      ? options.aliases[optionKey]
      : [options.aliases[optionKey]];
    for (let item of aliasesForKey) {
      obj[item] = optionKey;
    }
    return obj;
  }, {});
  const parsed = {
    options: {},
    args: [],
  };
  let captureNext;
  for (let arg of argv) {
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
