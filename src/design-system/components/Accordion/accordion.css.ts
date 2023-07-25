import { keyframes, style } from '@vanilla-extract/css';

const contentHeight = `var(--radix-accordion-content-height)`;

const slideDown = keyframes({
  from: { height: 0, opacity: 0 },
  to: { height: contentHeight, opacity: 1 },
});

const slideUp = keyframes({
  from: { height: contentHeight, opacity: 1 },
  to: { height: 0, opacity: 0 },
});

export const content = style({
  overflow: 'hidden',
  animationDuration: '200ms',
  animationTimingFunction: 'ease-in-out',
  selectors: {
    '&[data-state="open"]': { animationName: slideDown },
    '&[data-state="closed"]': { animationName: slideUp },
  },
});

export const trigger = style({});

export const chevron = style({
  transition: 'transform 200ms ease-in-out',
  selectors: {
    [`${trigger}[data-state="open"] &`]: { transform: 'rotate(180deg)' },
  },
});
