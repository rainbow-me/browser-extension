export const simulateClick = (el: Element | null, options?: MouseEventInit) => {
  const box = el?.getBoundingClientRect();
  const opts = options || {};
  if (box) {
    const e = new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: box.left + (box?.right - box.left) / 2,
      clientY: box.top + (box.bottom - box.top) / 2,
      ...opts,
    });
    el?.dispatchEvent(e);
    (el as HTMLDivElement)?.click();
  }
};

export const simulateContextClick = (
  el: Element | null,
  options?: MouseEventInit,
) => {
  const box = el?.getBoundingClientRect();
  if (box) {
    const e = new MouseEvent('contextmenu', {
      bubbles: true,
      clientX: box.left + (box?.right - box.left) / 2,
      clientY: box.top + (box.bottom - box.top) / 2,
      ...options,
    });
    el?.dispatchEvent(e);
  }
};
