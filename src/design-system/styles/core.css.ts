import { themeClasses, rootThemeClasses } from './themeClasses';
import {
  style,
  globalStyle,
  globalFontFace,
  createThemeContract,
  assignVars,
  createVar,
} from '@vanilla-extract/css';
import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles';
import { createStyleObject as capsize } from '@capsizecss/core';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import {
  space,
  negativeSpace,
  positionSpace,
  backgroundColors,
  foregroundColors,
  textColors,
  strokeWeights,
  radii,
  separatorColors,
  strokeColors,
} from './designTokens';
import SFRoundedRegular from './fonts/subset-SFRounded-Regular.woff2';
import SFRoundedMedium from './fonts/subset-SFRounded-Medium.woff2';
import SFRoundedSemibold from './fonts/subset-SFRounded-Semibold.woff2';
import SFRoundedBold from './fonts/subset-SFRounded-Bold.woff2';
import SFRoundedHeavy from './fonts/subset-SFRounded-Heavy.woff2';

export const resetBase = style({
  margin: 0,
  padding: 0,
  border: 0,
  fontSize: '100%',
  font: 'inherit',
  verticalAlign: 'baseline',
});

const a = style({ textDecoration: 'none', color: 'inherit' });
const list = style({ listStyle: 'none' });
const table = style({ borderCollapse: 'collapse', borderSpacing: 0 });
const appearanceNone = style({ appearance: 'none' });
const backgroundTransparent = style({ backgroundColor: 'transparent' });
const field = [appearanceNone, backgroundTransparent];

const quotes = style({
  quotes: 'none',
  selectors: {
    '&:before, &:after': {
      content: ["''", 'none'],
    },
  },
});

const select = style([
  field,
  {
    ':disabled': {
      opacity: 1,
    },
    selectors: {
      '&::-ms-expand': {
        display: 'none',
      },
    },
  },
]);

const input = style([
  field,
  style({
    selectors: {
      '&::-ms-clear': {
        display: 'none',
      },
      '&::-webkit-search-cancel-button': {
        WebkitAppearance: 'none',
      },
    },
  }),
]);

export const resetElements = {
  a,
  blockquote: quotes,
  button: backgroundTransparent,
  input,
  ol: list,
  q: quotes,
  select,
  table,
  ul: list,
};

export const accentColorVar = createVar();

export const semanticColorVars = createThemeContract({
  backgroundColors: mapValues(backgroundColors, () => null),
  foregroundColors: mapValues(foregroundColors, () => null),
});

export const foregroundColorVars = semanticColorVars.foregroundColors;

globalStyle(`html.${rootThemeClasses.lightTheme}`, {
  backgroundColor: backgroundColors.surfacePrimary.light.color,
  vars: { [accentColorVar]: backgroundColors.blue.light.color },
});

globalStyle(`html.${rootThemeClasses.darkTheme}`, {
  backgroundColor: backgroundColors.surfacePrimary.dark.color,
  vars: { [accentColorVar]: backgroundColors.blue.dark.color },
});

globalStyle(
  [
    `html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.lightContext} > *`,
    `html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.lightContext} > *`,
  ].join(', '),
  {
    vars: assignVars(semanticColorVars, {
      backgroundColors: mapValues(backgroundColors, ({ light }) => light.color),
      foregroundColors: mapValues(foregroundColors, ({ light }) => light),
    }),
  },
);

globalStyle(
  [
    `html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.darkContext} > *`,
    `html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.darkContext} > *`,
  ].join(', '),
  {
    vars: assignVars(semanticColorVars, {
      backgroundColors: mapValues(backgroundColors, ({ dark }) => dark.color),
      foregroundColors: mapValues(foregroundColors, ({ dark }) => dark),
    }),
  },
);

const boxBaseProperties = defineProperties({
  properties: {
    alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
    backdropFilter: ['blur(26px)'],
    borderRadius: radii,
    borderWidth: mapValues(strokeWeights, (borderWidth) => ({
      borderStyle: 'solid',
      borderWidth,
    })),
    bottom: positionSpace,
    display: ['none', 'flex', 'block', 'inline'],
    flexDirection: ['row', 'column'],
    flexWrap: ['wrap'],
    gap: space,
    height: {
      full: '100%',
    },
    justifyContent: [
      'stretch',
      'flex-start',
      'center',
      'flex-end',
      'space-around',
      'space-between',
    ],
    left: positionSpace,
    marginBottom: negativeSpace,
    marginLeft: negativeSpace,
    marginRight: negativeSpace,
    marginTop: negativeSpace,
    paddingBottom: space,
    paddingLeft: space,
    paddingRight: space,
    paddingTop: space,
    position: ['relative', 'absolute', 'fixed'],
    right: positionSpace,
    top: positionSpace,
  },
  shorthands: {
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    paddingX: ['paddingLeft', 'paddingRight'],
    paddingY: ['paddingTop', 'paddingBottom'],
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    marginX: ['marginLeft', 'marginRight'],
    marginY: ['marginTop', 'marginBottom'],
    placeItems: ['justifyContent', 'alignItems'],
  },
});

const boxColorProperties = defineProperties({
  conditions: {
    light: { selector: `html.${rootThemeClasses.lightTheme} &` },
    dark: { selector: `html.${rootThemeClasses.darkTheme} &` },
  },
  defaultCondition: ['light', 'dark'],
  properties: {
    background: {
      accent: accentColorVar,
      ...semanticColorVars.backgroundColors,
    },
    borderColor: pick(semanticColorVars.foregroundColors, [
      ...separatorColors,
      ...strokeColors,
    ] as const),
  },
});

export const boxStyles = createSprinkles(boxBaseProperties, boxColorProperties);
export type BoxStyles = Parameters<typeof boxStyles>[0];

[
  [SFRoundedRegular, 400],
  [SFRoundedMedium, 500],
  [SFRoundedSemibold, 600],
  [SFRoundedBold, 700],
  [SFRoundedHeavy, 800],
].forEach(([fontPath, fontWeight]) => {
  globalFontFace('SFRounded', {
    src: `url('${fontPath}') format('woff2')`,
    fontWeight,
    fontStyle: 'normal',
    fontDisplay: 'auto',
  });
});

const fontMetrics = {
  capHeight: 1443,
  ascent: 1950,
  descent: -494,
  lineGap: 0,
  unitsPerEm: 2048,
};

function defineType(
  fontSize: number,
  lineHeight: number | `${number}%`,
  letterSpacing: number,
) {
  const leading =
    typeof lineHeight === 'number'
      ? lineHeight
      : (fontSize * parseInt(lineHeight)) / 100;

  return {
    ...capsize({ fontMetrics, fontSize, leading }),
    letterSpacing,
  };
}

const textProperties = defineProperties({
  properties: {
    color: {
      accent: accentColorVar,
      ...pick(semanticColorVars.foregroundColors, textColors),
    },
    fontFamily: { rounded: 'SFRounded' },
    fontSize: {
      '11pt': defineType(11, 13, 0.56),
      '12pt': defineType(12, 15, 0.52),
      '14pt': defineType(14, 19, 0.48),
      '14pt / 135%': defineType(14, '135%', 0.48),
      '14pt / 155%': defineType(14, '150%', 0.48),
      '16pt': defineType(16, 21, 0.35),
      '16pt / 135%': defineType(16, '135%', 0.35),
      '16pt / 155%': defineType(16, '150%', 0.35),
      '20pt': defineType(20, 25, 0.36),
      '20pt / 135%': defineType(20, '135%', 0.36),
      '20pt / 150%': defineType(20, '150%', 0.36),
      '23pt': defineType(23, 29, 0.35),
      '26pt': defineType(26, 32, 0.36),
      '32pt': defineType(32, 40, 0.41),
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      heavy: 800,
    },
    textAlign: ['left', 'center', 'right'],
  },
});

export const textStyles = createSprinkles(textProperties);
export type TextStyles = Parameters<typeof textStyles>[0];
