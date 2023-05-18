import { getActiveModal } from './activeElement';

export const simulateTab = (forwards: boolean) => {
  const activeElement = document.activeElement;
  if (activeElement) {
    const modal = getActiveModal();
    const target = modal || document;

    const tabbableNodeList = target.querySelectorAll(
      '[tabindex]:not([tabindex="-1"])',
    );
    const activeIndex = Array.from(tabbableNodeList).indexOf(activeElement);
    const activeElementIsFirst = activeIndex === 0;
    const lastIndex = tabbableNodeList.length - 1;
    const activeElementIsLast = activeIndex === lastIndex;

    let nextIndex;
    if (activeElementIsFirst && !forwards) {
      nextIndex = lastIndex;
    } else if (activeElementIsLast && forwards) {
      nextIndex = 0;
    } else {
      nextIndex = activeIndex + (forwards ? 1 : -1);
    }

    const nextElement = tabbableNodeList[nextIndex];

    if (nextElement) {
      (nextElement as HTMLButtonElement).focus();
    }
  }
};
