import { globalFontFace, globalStyle } from '@vanilla-extract/css';
import { backgroundColors } from '../../styles/designTokens';
import { rootThemeClasses } from '../../styles/theme';

globalStyle('html, body', {
  boxSizing: 'border-box',
  margin: 0,
  MozOsxFontSmoothing: 'grayscale',
  padding: 0,
  textRendering: 'optimizeLegibility',
  WebkitFontSmoothing: 'antialiased',
  WebkitTextSizeAdjust: '100%',
});

// TODO: Remove specificity workaround once side-effects are removed from core.css.ts
globalStyle(
  `html.${rootThemeClasses.darkTheme}.${rootThemeClasses.darkTheme}`,
  {
    backgroundColor: backgroundColors.surfacePrimaryElevated.dark.color,
  },
);

// TODO: Remove specificity workaround once side-effects are removed from core.css.ts
globalStyle(
  `html.${rootThemeClasses.lightTheme}.${rootThemeClasses.lightTheme}`,
  {
    backgroundColor: backgroundColors.surfacePrimaryElevated.light.color,
  },
);

globalFontFace('SFMono', {
  src: `url('/SFMonoMedium.woff') format('woff')`,
  fontWeight: 500,
  fontStyle: 'normal',
  fontDisplay: 'auto',
});
