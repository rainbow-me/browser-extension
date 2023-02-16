import { keyframes, style } from '@vanilla-extract/css';

const shimmer = keyframes({
  '100%': { transform: 'translateX(100%)' },
});

const initalBg = 'rgba(245, 248, 255, 0.02)';
const finalBg =
  'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.01) 20%, rgba(255, 255, 255, 0.02) 60%, rgba(255, 255, 255, 0))';

export const skeletonCircle = style({
  display: 'inline-block',
  borderRadius: '100%',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: initalBg,
  width: '36px',
  height: '36px',

  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: 'translateX(-100%)',
    animationName: shimmer,
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    backgroundImage: finalBg,
  },
});

export const skeletonLine = style({
  display: 'inline-block',
  borderRadius: '10px',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: initalBg,

  '::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: 'translateX(-100%)',
    animationName: shimmer,
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    backgroundImage: finalBg,
  },
});
