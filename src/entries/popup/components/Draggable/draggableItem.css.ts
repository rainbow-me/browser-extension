import { styleVariants } from '@vanilla-extract/css';

import { transparentAccentColorAsHsl } from '~/design-system/styles/core.css';

const baseStyles = {
  borderRadius: '12px',
  transition: 'all .2s ease-in-out',
};

export const dragabbleItem = styleVariants({
  idle: {
    ...baseStyles,
    ':hover': { backgroundColor: transparentAccentColorAsHsl },
    ':active': { scale: 0.96 },
    cursor: 'default',
  },
  dragging: {
    ...baseStyles,
    scale: 1.02,
    backgroundColor: transparentAccentColorAsHsl,
    backdropFilter: 'blur(12px) grayscale(100%)',
    cursor: 'grabbing',
  },
});
