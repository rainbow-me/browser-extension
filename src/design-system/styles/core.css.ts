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

const semanticColorVars = createThemeContract({
  backgroundColors: mapValues(backgroundColors, () => null),
  foregroundColors: mapValues(foregroundColors, () => null),
});

globalStyle('html.lightTheme', {
  backgroundColor: backgroundColors.surfacePrimary.light.color,
  vars: { [accentColorVar]: backgroundColors.blue.light.color },
});

globalStyle('html.darkTheme', {
  backgroundColor: backgroundColors.surfacePrimary.dark.color,
  vars: { [accentColorVar]: backgroundColors.blue.dark.color },
});

globalStyle(
  [
    'html.lightTheme .lightTheme-lightContext > *',
    'html.darkTheme .darkTheme-lightContext > *',
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
    'html.darkTheme .darkTheme-darkContext > *',
    'html.lightTheme .lightTheme-darkContext > *',
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
    bottom: positionSpace,
    display: ['none', 'flex', 'block', 'inline'],
    flexDirection: ['row', 'column'],
    gap: space,
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
    light: { selector: 'html.lightTheme &' },
    dark: { selector: 'html.darkTheme &' },
  },
  defaultCondition: ['light', 'dark'],
  properties: {
    background: {
      accent: accentColorVar,
      ...semanticColorVars.backgroundColors,
    },
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

function fontSize(fontSize: number, lineHeight: number | `${number}%`) {
  const leading =
    typeof lineHeight === 'number'
      ? lineHeight
      : (fontSize * parseInt(lineHeight)) / 100;

  return capsize({ fontMetrics, fontSize, leading });
}

const textProperties = defineProperties({
  properties: {
    color: {
      accent: accentColorVar,
      ...pick(semanticColorVars.foregroundColors, textColors),
    },
    fontFamily: { rounded: 'SFRounded' },
    fontSize: {
      '11pt': fontSize(11, 14),
      '12pt': fontSize(12, 16),
      '13pt': fontSize(13, 18),
      '13pt / 135%': fontSize(13, '135%'),
      '13pt / 150%': fontSize(13, '150%'),
      '15pt': fontSize(15, 20),
      '15pt / 135%': fontSize(15, '135%'),
      '15pt / 150%': fontSize(15, '150%'),
      '17pt': fontSize(17, 22),
      '17pt / 135%': fontSize(17, '135%'),
      '17pt / 150%': fontSize(17, '150%'),
      '20pt': fontSize(20, 24),
      '20pt / 135%': fontSize(20, '135%'),
      '20pt / 150%': fontSize(20, '150%'),
      '22pt': fontSize(22, 28),
      '26pt': fontSize(26, 32),
      '30pt': fontSize(30, 37),
      '34pt': fontSize(34, 41),
      '44pt': fontSize(44, 52),
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
