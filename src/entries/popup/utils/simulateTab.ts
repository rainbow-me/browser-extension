import { getActiveModal, getExplainerSheet } from './activeElement';

export const simulateTab = (forwards: boolean) => {
  const activeElement = document.activeElement;
  console.log('activeElement -- ', activeElement);
  if (activeElement) {
    const modal = getActiveModal();
    console.log('modal -- ', modal);
    const explainer = getExplainerSheet();
    console.log('explainer -- ', explainer);
    const target = explainer || modal || document;
    console.log('target -- ', target);

    const tabbableArray = Array.from(
      target.querySelectorAll('[tabindex]:not([tabindex="-1"])'),
    );
    console.log('tabbableArray -- ', tabbableArray);
    const getTabIndexFromElement = (element: Element) => {
      return parseInt(
        element?.attributes?.getNamedItem('tabIndex')?.value || '0',
      );
    };
    const customOrderArray: Element[] = [];
    const defaultOrderArray: Element[] = [];
    tabbableArray.forEach((element: Element) => {
      if (element.attributes?.getNamedItem('disabled')) return;
      const tabIndex = getTabIndexFromElement(element);
      if (tabIndex > 0) {
        customOrderArray.push(element);
      } else {
        defaultOrderArray.push(element);
      }
    });
    const sortedCustomOrderArray = customOrderArray.sort(
      (elOne: Element, elTwo: Element) => {
        return getTabIndexFromElement(elOne) - getTabIndexFromElement(elTwo);
      },
    );
    console.log('sortedCustomOrderArray -- ', sortedCustomOrderArray);
    const tabbableNodeList = sortedCustomOrderArray.concat(defaultOrderArray);
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
