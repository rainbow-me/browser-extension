import { getActiveModal } from './activeElement';

export const simulateTab = (forwards: boolean) => {
  const activeElement = document.activeElement;
  if (activeElement) {
    const modal = getActiveModal();
    const target = modal || document;

    const tabbableArray = Array.from(
      target.querySelectorAll('[tabindex]:not([tabindex="-1"])'),
    );
    const manuallyOrderedArray = tabbableArray
      .filter((a: Element) =>
        parseInt(a?.attributes?.getNamedItem('tabIndex')?.value || '0'),
      )
      .sort((a: Element, b: Element) => {
        const foo = parseInt(
          a?.attributes?.getNamedItem('tabIndex')?.value || '0',
        );
        const bar = parseInt(
          b?.attributes.getNamedItem('tabIndex')?.value || '0',
        );
        return foo - bar;
      });
    const tabbableNodeList = manuallyOrderedArray.concat(
      tabbableArray.filter((a: Element) => {
        return !parseInt(a?.attributes?.getNamedItem('tabIndex')?.value || '0');
      }),
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
