export const useSystemSpecificModifierKey = () => {
  const modifierKey = navigator.userAgent.includes('Mac')
    ? 'metaKey'
    : 'ctrlKey';
  const modifierSymbol = navigator.userAgent.includes('Mac') ? '⌘' : 'Ctrl-';
  return { modifierKey, modifierSymbol };
};
