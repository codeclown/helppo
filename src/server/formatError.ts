export default function formatError(
  error: Error,
  env: string = process.env.NODE_ENV,
  // eslint-disable-next-line no-console
  logError: (message: string) => void = console.error
): string {
  if (env === "production") {
    logError(error.stack);
    return "An unexpected error has occurred";
  }
  return error.message;
}
