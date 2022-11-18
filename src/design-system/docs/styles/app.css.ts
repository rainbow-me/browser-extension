import { style } from '@vanilla-extract/css';
import { semanticColorVars } from '../../styles/core.css';

export const page = style({
  maxWidth: '1200px',
  margin: '0 auto',
});

export const desktopSidebar = style({
  height: '100%',
  overflowY: 'scroll',
  paddingBottom: '100px',
  position: 'fixed',
  width: '260px',
  '@media': {
    'screen and (max-width: 1023px)': {
      visibility: 'hidden',
    },
  },
});

export const mobileSidebar = style({
  background: semanticColorVars.backgroundColors.surfacePrimaryElevated,
  position: 'fixed',
  height: '100vh',
  width: '100%',
  marginTop: '60px',
  zIndex: 999,
  '@media': {
    'screen and (min-width: 1024px)': {
      visibility: 'hidden',
    },
  },
});

export const mobileHeader = style({
  background: semanticColorVars.backgroundColors.surfacePrimaryElevated,
  position: 'fixed',
  height: '60px',
  width: '100%',
  zIndex: 999,
  '@media': {
    'screen and (min-width: 1024px)': {
      visibility: 'hidden',
    },
  },
});

export const container = style({
  maxWidth: '768px',
  margin: '0 auto',
  padding: '0 16px',
});

export const content = style({
  '@media': {
    'screen and (max-width: 1023px)': {
      margin: '0 auto',
      paddingTop: '20px',
    },
    'screen and (min-width: 1024px)': {
      margin: '0',
      marginLeft: '260px',
    },
  },
});
