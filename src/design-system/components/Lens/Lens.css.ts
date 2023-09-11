import { style } from '@vanilla-extract/css';

import {
  outlineAccentColorAsHsl,
  outlineAvatarColorAsHsl,
  transparentAccentColorAsHsl,
  transparentAvatarColorAsHsl,
} from '../../styles/core.css';

export const accentFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
      boxShadow: `inset 0 0 0 1px ${outlineAccentColorAsHsl}`,
    },
  },
});

export const accentMenuFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
      boxShadow: `inset 0 0 0 1px ${outlineAccentColorAsHsl}`,
    },
  },
});

export const avatarFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAvatarColorAsHsl,
      boxShadow: `inset 0 0 0 1px ${outlineAvatarColorAsHsl}`,
    },
  },
});
