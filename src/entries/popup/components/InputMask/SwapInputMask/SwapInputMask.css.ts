import { keyframes, style as vanillaStyle } from '@vanilla-extract/css';

// Pulse animation for input text
export const pulseText = keyframes({
  '0%': { opacity: 1 },
  '50%': { opacity: 0.5 },
  '100%': { opacity: 1 },
});
export const pulseTextStyle = vanillaStyle({
  animation: `${pulseText} 1s infinite`,
  selectors: {
    '&::placeholder': {
      animation: 'none', // Don't pulse placeholder
    },
  },
});
