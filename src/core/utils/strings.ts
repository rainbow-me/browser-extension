export const isLowerCaseMatch = (a?: string, b?: string) =>
  a?.toLowerCase() === b?.toLowerCase();

export const upperFirst = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);

export const truncateString = (txt = '', maxLength = 22) => {
  return `${txt?.slice(0, maxLength)}${txt.length > maxLength ? '…' : ''}`;
};
