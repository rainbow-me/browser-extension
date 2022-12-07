import { style } from '@vanilla-extract/css';

import { globalColors } from '~/design-system/styles/designTokens';

import pendingMask from '../../../../../static/assets/masks/pending_mask.png';

export const spinnerStyle = style([
  {
    backgroundColor: globalColors.blue50,
    WebkitMaskImage: `url(${pendingMask})`,
    WebkitMaskSize: '8px 8px',
    height: 8,
    width: 8,
  },
]);
