import { simulateClick } from './simulateClick';

export const NAVBAR_LEFT_COMPONENT_ID = 'navbar-left-component';
export const NAVBAR_RIGHT_COMPONENT_ID = 'navbar-right-component';

export const clickHeaderLeft = () => {
  const leftActionButton = document.querySelector(
    `#${NAVBAR_LEFT_COMPONENT_ID} button`,
  );
  simulateClick(leftActionButton);
};

export const clickHeaderRight = () => {
  const rightActionButton = document.querySelector(
    `#${NAVBAR_RIGHT_COMPONENT_ID} button`,
  );
  simulateClick(rightActionButton);
};
