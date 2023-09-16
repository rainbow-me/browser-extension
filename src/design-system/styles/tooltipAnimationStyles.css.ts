import { keyframes, style } from '@vanilla-extract/css';

const enterBottom = keyframes({
  from: {
    opacity: 0,
    transform: 'scale(0.96) translateY(-5px)',
  },
  to: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
});

const exitBottom = keyframes({
  from: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
  to: {
    opacity: 0,
    transform: 'scale(0.96) translateY(-5px)',
  },
});

const enterTop = keyframes({
  from: {
    opacity: 0,
    transform: 'scale(0.96) translateY(5px)',
  },
  to: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
});

const exitTop = keyframes({
  from: {
    opacity: 1,
    transform: 'scale(1) translateY(0)',
  },
  to: {
    opacity: 0,
    transform: 'scale(0.96) translateY(5px)',
  },
});

export const tooltipAnimation = style({
  animationDuration: '0.125s',
  animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
  selectors: {
    '&[data-side="top"]': {
      animationName: enterTop,
    },
    '&[data-side="top"]&[data-state="closed"]': {
      animationName: exitTop,
    },
    '&[data-side="bottom"]': {
      animationName: enterBottom,
    },
    '&[data-side="bottom"]&[data-state="closed"]': {
      animationName: exitBottom,
    },
  },
});
