// ============================================================================
// General Element Helpers
// ============================================================================

export const getActiveElement = () => document.activeElement;

// Checks if an input/textarea is focused (used to prevent shortcuts while typing)
export const inputIsFocused = () => {
  const tagName = getActiveElement()?.tagName || '';
  return ['INPUT', 'TEXTAREA'].includes(tagName);
};

// ============================================================================
// Modal and Sheet Detectors
// ============================================================================

// Returns the active modal element (BottomSheets, Prompts, DropdownMenus, etc.)
export const getActiveModal = () =>
  document.querySelector('div[data-is-modally-presented]');

// Detects any modal with isModal prop (BottomSheets, Prompts, DropdownMenus, etc.)
// Used by shortcut handlers to block keyboard shortcuts when modals are active
export const modalIsActive = () => !!getActiveModal();

// ============================================================================
// Menu Detectors
// ============================================================================

// Detects Radix UI popper menus (context menus, dropdowns)
export const radixIsActive = () =>
  !!document.querySelector('div[data-radix-popper-content-wrapper]');

// Detects network switcher menu
export const switchNetworkMenuIsActive = () =>
  !!document.getElementById('switch-network-menu-selector');

// Detects app connection menu (DApp connection management)
export const appConnectionMenuIsActive = () =>
  !!document.getElementById('app-connection-menu-selector-open');

// Detects wallet switcher prompt in DApp connection flow
export const appConnectionSwitchWalletsPromptIsActive = () =>
  !!document.getElementById('app-connection-switch-wallets-prompt');
