export const isLowerCaseMatch = (a?: string, b?: string) =>
  a?.toLowerCase() === b?.toLowerCase();

export const upperFirst = (a: string) =>
  a.charAt(0).toUpperCase() === a.slice(1);
