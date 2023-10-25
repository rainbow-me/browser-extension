import { style } from '@vanilla-extract/css';

import {
  POPUP_DIMENSIONS,
  TESTNET_MODE_BAR_HEIGHT,
} from '~/core/utils/dimensions';

export const animatedRouteStyles = style({
  minHeight: POPUP_DIMENSIONS.height,
});

export const animatedRouteTestnetModeStyles = style({
  minHeight: POPUP_DIMENSIONS.height - TESTNET_MODE_BAR_HEIGHT,
});
