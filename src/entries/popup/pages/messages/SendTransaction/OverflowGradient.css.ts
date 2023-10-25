import { style } from '@vanilla-extract/css';

// surfaceSecondaryElevated

export const overflowGradient = style([
  {
    position: 'relative',
    overflow: 'hidden',
    // paddingTop: '38px',
    // marginTop: '-38px',
    // paddingBottom: '38px',
    // marginBottom: '-38px',
    '::after': {
      content: '',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '38px',
      background:
        'linear-gradient(180deg, rgba(36, 37, 41, 0.00) 0%, #242529 100%)',
    },
    // '::before': {
    //   content: '',
    //   position: 'absolute',
    //   top: 0,
    //   left: 0,
    //   right: 0,
    //   height: '38px',
    //   background:
    //     'linear-gradient(0deg, rgba(36, 37, 41, 0.00) 0%, #242529 100%)',
    // },
  },
]);
