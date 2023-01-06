import { style } from '@vanilla-extract/css';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';

export const animatedRouteStyles = style({
  minHeight: POPUP_DIMENSIONS.height,
});
