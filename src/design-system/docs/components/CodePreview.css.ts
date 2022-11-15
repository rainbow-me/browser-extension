import { createVar, globalStyle } from '@vanilla-extract/css';
import { backgroundColors } from '../../styles/designTokens';
import { rootThemeClasses, themeClasses } from '../../styles/theme';

export const codePreviewBackgroundColorVar = createVar();

globalStyle(
  `html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.lightContext}, html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.lightContext}`,
  {
    vars: {
      [codePreviewBackgroundColorVar]:
        backgroundColors.surfaceSecondary.light.color,
    },
  },
);

globalStyle(
  `html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.darkContext}, html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.darkContext}`,
  {
    vars: {
      [codePreviewBackgroundColorVar]:
        backgroundColors.surfaceSecondaryElevated.dark.color,
    },
  },
);
