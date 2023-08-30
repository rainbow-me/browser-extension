import { keyframes, style } from '@vanilla-extract/css';

export const pendingDashLenght = 50;

const line = keyframes({
  '100%': { strokeDashoffset: pendingDashLenght },
});

export const pendingStyle = style([
  {
    strokeDasharray: `${pendingDashLenght}px var(--activity-pill-pending-dashArray-gap)`,
    strokeDashoffset: `calc(-1 * var(--activity-pill-pending-dashArray-gap))`,
    animationName: line,
    animationDuration: '2.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
]);
