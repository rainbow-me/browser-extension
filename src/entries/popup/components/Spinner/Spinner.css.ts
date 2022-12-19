import { keyframes, style } from '@vanilla-extract/css';

import pendingMask from 'static/assets/masks/pending_mask.png';
import { globalColors } from '~/design-system/styles/designTokens';

const MASK_HEIGHT = 8;
const maskImage = `url(${pendingMask})`;
const maskSize = `${MASK_HEIGHT}px ${MASK_HEIGHT}px`;

const rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const spinnerStyle = style([
  {
    backgroundColor: globalColors.blue50,
    maskImage,
    maskSize,
    WebkitMaskImage: maskImage,
    WebkitMaskSize: maskSize,
    height: MASK_HEIGHT,
    width: MASK_HEIGHT,
    animationName: rotate,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
]);
