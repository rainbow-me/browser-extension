import { style } from '@vanilla-extract/css';

export const commandKRowHoverStyle = style({
  transition: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      boxShadow: '0px 3px 9px rgba(0, 0, 0, 0.01)',
      transition: 'none',
    },
  },
});

export const commandKRowHoverStyleDark = style({
  transition: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(245, 248, 255, 0.05)',
      boxShadow: '0px 3px 9px rgba(0, 0, 0, 0.025)',
      transition: 'none',
    },
  },
});

export const commandKRowSelectedStyle = style({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  boxShadow:
    '0px 3px 9px rgba(0, 0, 0, 0.02), inset 0px 0.5px 2px #FFFFFF, inset 0px -1px 6px #FFFFFF',
  transition: 'none',
});

export const commandKRowSelectedStyleDark = style({
  backgroundColor: 'rgba(245, 248, 255, 0.1)',
  boxShadow:
    '0px 3px 9px rgba(0, 0, 0, 0.1), inset 0px 0.5px 2px rgba(245, 248, 255, 0.07), inset 0px -1px 6px rgba(245, 248, 255, 0.05)',
  transition: 'none',
});
