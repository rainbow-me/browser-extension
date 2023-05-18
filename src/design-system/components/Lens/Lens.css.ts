import { style } from '@vanilla-extract/css';

import {
  accentColorAsHsl,
  avatarColorAsHsl,
  transparentAccentColorAsHsl,
  transparentAvatarColorAsHsl,
} from '../../styles/core.css';

export const accentFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
      outline: '1px solid',
      outlineColor: accentColorAsHsl,
    },
  },
});

export const accentMenuFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAccentColorAsHsl,
    },
  },
});

export const avatarFocusVisibleStyle = style({
  selectors: {
    '&:focus': {
      backgroundColor: transparentAvatarColorAsHsl,
      outline: '1px solid',
      outlineColor: avatarColorAsHsl,
    },
  },
});
