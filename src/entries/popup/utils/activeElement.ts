export const getActiveElement = () => document.activeElement;
export const getActiveModal = () =>
  document.querySelector('div[data-is-modally-presented]');
export const getInputIsFocused = () => getActiveElement()?.tagName === 'INPUT';
export const radixIsActive = () =>
  !!document.querySelector('div[data-radix-popper-content-wrapper]');
export const switchNetworkMenuIsActive = () =>
  !!document.getElementById('switch-network-menu-selector');
