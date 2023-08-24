import { simulateClick } from './simulateClick';

export const NAVBAR_LEFT_COMPONENT_ID = 'navbar-left-component';
export const NAVBAR_RIGHT_COMPONENT_ID = 'navbar-right-component';

export const clickHeaderLeft = () => {
  const leftActionButton = document.querySelector(
    '#app-connection-menu-selector-closed div',
  );
  simulateClick(leftActionButton);
};

export const clickHeaderRight = () => {
  const rightActionButton = document.querySelector(
    `#${NAVBAR_RIGHT_COMPONENT_ID} button`,
  );
  // shotgunning this --
  // simulateClick works when header component is wrapped in radix UI
  // element.click works when it's not
  simulateClick(rightActionButton);
  (rightActionButton as HTMLButtonElement)?.click?.();
};
