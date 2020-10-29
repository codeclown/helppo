export default function errorHandler(
  error,
  env = process.env.NODE_ENV,
  // eslint-disable-next-line no-console
  logError = console.error
) {
  if (env === "production") {
    logError(error.stack);
    return "An unexpected error has occurred";
  }
  return error.message;
}
