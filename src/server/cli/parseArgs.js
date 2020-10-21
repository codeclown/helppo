export default function parseArgs(args) {
  const defaults = {
    showHelp: false,
    showColors: true,
    connectionString: "",
    dev: false,
  };

  const connectionStrings = [];
  const options = [];

  for (let arg of args) {
    if (arg === "-h" || arg === "--help") {
      return Object.assign({}, defaults, {
        showHelp: true,
      });
    }

    if (arg === "--no-color") {
      options.push(arg);
      continue;
    }

    // Internal flag for deciding which version of helppo to require()
    if (arg === "--dev") {
      options.push(arg);
      continue;
    }

    connectionStrings.push(arg);
  }

  if (connectionStrings.length !== 1) {
    return Object.assign({}, defaults, {
      showHelp: true,
    });
  }

  return Object.assign({}, defaults, {
    showColors: !options.includes("--no-color"),
    dev: options.includes("--dev"),
    connectionString: connectionStrings[0],
  });
}
