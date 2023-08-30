import { keyframes, style } from '@vanilla-extract/css';

const line = keyframes({
  '0%': { strokeDashoffset: '-180' },
  '100%': { strokeDashoffset: '90' },
});

export const pendingStyle = style([
  {
    strokeDasharray: '90px 180px',
    strokeDashoffset: -180,

    animationName: line,
    animationDuration: '2.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
]);
