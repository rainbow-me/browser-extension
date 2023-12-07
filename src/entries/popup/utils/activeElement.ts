export const getActiveElement = () => document.activeElement;
export const getActiveModal = () =>
  document.querySelector('div[data-is-modally-presented]');
export const getExplainerSheet = () =>
  document.querySelector('div[data-is-explainer-sheet]');
export const getInputIsFocused = () => {
  const tagName = getActiveElement()?.tagName || '';
  return ['INPUT', 'TEXTAREA'].includes(tagName);
};
export const radixIsActive = () =>
  !!document.querySelector('div[data-radix-popper-content-wrapper]');
export const switchNetworkMenuIsActive = () =>
  !!document.getElementById('switch-network-menu-selector');
export const appConnectionMenuIsActive = () =>
  !!document.getElementById('app-connection-menu-selector-open');
export const appConnectionSwitchWalletsPromptIsActive = () =>
  !!document.getElementById('app-connection-switch-wallets-prompt');
