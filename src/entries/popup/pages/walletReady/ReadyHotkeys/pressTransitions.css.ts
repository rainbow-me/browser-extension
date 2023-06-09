import { style, styleVariants } from '@vanilla-extract/css';

const baseTransitions = style({
  transition: 'opacity 0.2s ease-in-out, top 0.2s ease-in-out',
  transitionProperty: 'top',
  transitionDelay: '0.17s',
});

export const activeTransitions = styleVariants({
  pressed: [baseTransitions, { top: '2px', opacity: 1 }],
  'not pressed': [baseTransitions, { top: 0, opacity: 0 }],
});

export const inactiveTransitions = styleVariants({
  pressed: [baseTransitions, { top: '2px', opacity: 0 }],
  'not pressed': [baseTransitions, { top: 0, opacity: 1 }],
});
