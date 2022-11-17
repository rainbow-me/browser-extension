import { styleVariants } from '@vanilla-extract/css';

import { buttonHeights } from '../Button/ButtonWrapper.css';

export const widthStyles = styleVariants(buttonHeights, (height) => [
  { width: height },
]);
