import { keyframes, style } from '@vanilla-extract/css';

const animation = keyframes({
  '0%': { transform: 'scale(0.8) rotate(0)' },
  '25%': { transform: 'scale(1) rotate(90deg)' },
  '50%': { transform: 'scale(0.8) rotate(0)' },
  '75%': { transform: 'scale(1) rotate(-90deg)' },
  '100%': { transform: 'scale(0.8) rotate(0)' },
});

const animationY = keyframes({
  '0%': { transform: 'translateY(8px)' },
  '25%': { transform: 'translateY(-4px)' },
  '50%': { transform: 'translateY(8px)' },
  '75%': { transform: 'translateY(-4px)' },
  '100%': { transform: 'translateY(8px)' },
});

export const sparkleAnimationStyle = style([
  {
    animationName: animation,
    animationDuration: '8s',
    animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
    animationIterationCount: 'infinite',
    transformOrigin: 'center center',
    willChange: 'transform',
  },
]);

export const sparkleAnimationYStyle = style([
  {
    animationName: animationY,
    animationDuration: '8s',
    animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
    animationIterationCount: 'infinite',
    transformOrigin: 'center center',
    willChange: 'transform',
  },
]);
