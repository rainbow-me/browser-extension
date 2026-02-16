export const getErrorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);
