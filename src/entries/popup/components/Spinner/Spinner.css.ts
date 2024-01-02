import { keyframes, style } from '@vanilla-extract/css';

import pendingMask from 'static/assets/masks/pending_mask.png';

const maskImage = `url(${pendingMask})`;

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const spinnerStyle = style([
  {
    maskImage,
    WebkitMaskImage: maskImage,
    animationName: rotate,
    animationDuration: '0.5s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
    willChange: 'transform',
  },
]);
