import { createStyleObject as capsize } from '@capsizecss/core';
import {
  assignVars,
  createThemeContract,
  createVar,
  globalFontFace,
  globalStyle,
  style,
} from '@vanilla-extract/css';
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import chroma from 'chroma-js';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';

import {
  BackgroundColor,
  ColorContext,
  ShadowColor,
  backgroundColors,
  buttonColors,
  fontWeights,
  foregroundColors,
  negativeSpace,
  positionSpace,
  radii,
  separatorColors,
  shadowColors,
  space,
  strokeColors,
  strokeWeights,
  textColors,
} from './designTokens';
import SFRoundedBold from './fonts/subset-SFRounded-Bold.woff2';
import SFRoundedHeavy from './fonts/subset-SFRounded-Heavy.woff2';
import SFRoundedMedium from './fonts/subset-SFRounded-Medium.woff2';
import SFRoundedRegular from './fonts/subset-SFRounded-Regular.woff2';
import SFRoundedSemibold from './fonts/subset-SFRounded-Semibold.woff2';
import { hslObjectForColor } from './hslObjectForColor';
import { rootThemeClasses, themeClasses } from './theme';

export const resetBase = style({
  margin: 0,
  padding: 0,
  border: 0,
  boxSizing: 'border-box',
  fontSize: '100%',
  font: 'inherit',
  verticalAlign: 'baseline',
});

const a = style({ textDecoration: 'none', color: 'inherit' });
const list = style({ listStyle: 'none' });
const table = style({ borderCollapse: 'collapse', borderSpacing: 0 });
const appearanceNone = style({ appearance: 'none' });
const backgroundTransparent = style({ backgroundColor: 'transparent' });
const button = style([backgroundTransparent, { cursor: 'default' }]);
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
  ...field,
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
  ...field,
  style({
    selectors: {
      '&::-ms-clear': {
        display: 'none',
      },
      '&::-webkit-search-cancel-button': {
        WebkitAppearance: 'none',
      },
      '&:focus-visible': {
        outline: 'none',
      },
    },
  }),
]);

export const resetElements = {
  a,
  blockquote: quotes,
  button,
  input,
  ol: list,
  q: quotes,
  select,
  table,
  ul: list,
};

// The accent color needs to be stored as separate variables
// for HSL so that we can dynamically alter the opacity, most
// notably for use with shadow colors,
// i.e. hsl(var(--h), var(--s), var(--l), 0.2)
// We're using HSL rather than RGB since it's a more useful
// color space to work with, giving you more natural control
// over the different aspects of the color like updating
// the saturation in isolation without changing the hue.
export const accentColorHslVars = createThemeContract({
  hue: null,
  saturation: null,
  lightness: null,
});

const getAccentColorAsHsl = ({ alpha }: { alpha?: number } = {}) =>
  `hsl(${[
    accentColorHslVars.hue,
    accentColorHslVars.saturation,
    accentColorHslVars.lightness,
    ...(alpha !== undefined ? [alpha] : []),
  ].join(', ')})`;

export const accentColorAsHsl = getAccentColorAsHsl();
export const transparentAccentColorAsHsl = getAccentColorAsHsl({ alpha: 0.1 });

export const semanticColorVars = createThemeContract({
  backgroundColors: mapValues(backgroundColors, () => null),
  foregroundColors: mapValues(foregroundColors, () => null),
});

export const foregroundColorVars = semanticColorVars.foregroundColors;

interface ShadowDefinition {
  dark: string;
  light: string;
}

export type ShadowSize = '12px' | '18px' | '24px' | '30px';
export type Shadow = ShadowSize | `${ShadowSize} ${ShadowColor}`;

function coloredShadows<Size extends ShadowSize>(
  size: Size,
  getShadowForColor: (color: ShadowColor) => ShadowDefinition,
): Record<`${Size} ${ShadowColor}`, ShadowDefinition> {
  return Object.assign(
    {},
    ...shadowColors.map((color) => ({
      [`${size} ${color}`]: getShadowForColor(color),
    })),
  );
}

function getShadowColor(
  color: 'accent' | BackgroundColor,
  theme: ColorContext,
  alpha: number,
) {
  return color === 'accent'
    ? getAccentColorAsHsl({ alpha })
    : chroma(backgroundColors[color][theme].color).alpha(alpha).css();
}

const shadowTokens: Record<Shadow, ShadowDefinition> = {
  '12px': {
    light: [
      `0 4px 12px ${getShadowColor('shadowFar', 'light', 0.02)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 4px 12px ${getShadowColor('shadowFar', 'dark', 0.2)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  },
  ...coloredShadows('12px', (color) => ({
    light: [
      `0 4px 12px ${getShadowColor(color, 'light', 0.2)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 4px 12px ${getShadowColor('shadowFar', 'dark', 0.2)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  })),

  '18px': {
    light: [
      `0 6px 18px ${getShadowColor('shadowFar', 'light', 0.08)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 6px 18px ${getShadowColor('shadowFar', 'dark', 0.24)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  },
  ...coloredShadows('18px', (color) => ({
    light: [
      `0 6px 18px ${getShadowColor(color, 'light', 0.24)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 6px 18px ${getShadowColor('shadowFar', 'dark', 0.24)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  })),

  '24px': {
    light: [
      `0 8px 24px ${getShadowColor('shadowFar', 'light', 0.12)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 8px 24px ${getShadowColor('shadowFar', 'dark', 0.32)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  },
  ...coloredShadows('24px', (color) => ({
    light: [
      `0 8px 24px ${getShadowColor(color, 'light', 0.32)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 8px 24px ${getShadowColor('shadowFar', 'dark', 0.32)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  })),

  '30px': {
    light: [
      `0 10px 30px ${getShadowColor('shadowFar', 'light', 0.16)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 10px 30px ${getShadowColor('shadowFar', 'dark', 0.4)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  },
  ...coloredShadows('30px', (color) => ({
    light: [
      `0 10px 30px ${getShadowColor(color, 'light', 0.4)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'light', 0.02)}`,
    ].join(', '),
    dark: [
      `0 10px 30px ${getShadowColor('shadowFar', 'dark', 0.4)}`,
      `0 2px 6px ${getShadowColor('shadowNear', 'dark', 0.02)}`,
    ].join(', '),
  })),
};

export const shadowVars = createThemeContract(
  mapValues(shadowTokens, () => null),
);

export const shadows = Object.keys(shadowVars) as (keyof typeof shadowVars)[];

globalStyle(`html.${rootThemeClasses.lightTheme}`, {
  backgroundColor: backgroundColors.surfacePrimaryElevated.light.color,
  vars: assignVars(
    accentColorHslVars,
    hslObjectForColor(backgroundColors.blue.light.color),
  ),
});

globalStyle(`html.${rootThemeClasses.darkTheme}`, {
  backgroundColor: backgroundColors.surfacePrimaryElevated.dark.color,
  vars: assignVars(
    accentColorHslVars,
    hslObjectForColor(backgroundColors.blue.dark.color),
  ),
});

globalStyle(
  [
    `html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.lightContext} > *`,
    `html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.lightContext} > *`,
  ].join(', '),
  {
    vars: {
      ...assignVars(semanticColorVars, {
        backgroundColors: mapValues(backgroundColors, (x) => x.light.color),
        foregroundColors: mapValues(foregroundColors, (x) => x.light),
      }),
      ...assignVars(
        shadowVars,
        mapValues(shadowTokens, (x) => x.light),
      ),
    },
  },
);

globalStyle(
  [
    `html.${rootThemeClasses.lightTheme} .${themeClasses.lightTheme.darkContext} > *`,
    `html.${rootThemeClasses.darkTheme} .${themeClasses.darkTheme.darkContext} > *`,
  ].join(', '),
  {
    vars: {
      ...assignVars(semanticColorVars, {
        backgroundColors: mapValues(backgroundColors, (x) => x.dark.color),
        foregroundColors: mapValues(foregroundColors, (x) => x.dark),
      }),
      ...assignVars(
        shadowVars,
        mapValues(shadowTokens, (x) => x.dark),
      ),
    },
  },
);

export const gapVar = createVar();

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
    flexBasis: ['0'],
    flexGrow: ['0', '1'],
    flexShrink: ['0', '1'],
    gap: mapValues(space, (gap) => ({
      gap,
      vars: { [gapVar]: `${gap}px` },
    })),
    height: {
      fit: 'fit-content',
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
    opacity: ['0.1'],
    paddingBottom: space,
    paddingLeft: space,
    paddingRight: space,
    paddingTop: space,
    position: ['relative', 'absolute', 'fixed', 'sticky'],
    right: positionSpace,
    top: positionSpace,
    width: {
      fit: 'fit-content',
      full: '100%',
    },
  },
  shorthands: {
    padding: ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'],
    paddingHorizontal: ['paddingLeft', 'paddingRight'],
    paddingVertical: ['paddingTop', 'paddingBottom'],
    margin: ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'],
    marginHorizontal: ['marginLeft', 'marginRight'],
    marginVertical: ['marginTop', 'marginBottom'],
    placeItems: ['justifyContent', 'alignItems'],
  },
});

const boxColorProperties = defineProperties({
  conditions: {
    default: {},
    hover: { selector: '&:hover' },
    focus: { selector: '&:focus' },
    active: { selector: '&:active' },
    hoverActive: { selector: '&:hover:active' },
  },
  defaultCondition: 'default',
  properties: {
    background: {
      accent: accentColorAsHsl,
      ...semanticColorVars.backgroundColors,
    },
    borderColor: {
      accent: accentColorAsHsl,
      white: 'white',
      ...pick(semanticColorVars.foregroundColors, [
        'transparent',
        'label',
        ...separatorColors,
        ...strokeColors,
      ] as const),
      ...pick(semanticColorVars.backgroundColors, [...buttonColors] as const),
    },
    boxShadow: shadowVars,
  },
});

export const boxStyles = createSprinkles(boxBaseProperties, boxColorProperties);
export type BoxStyles = Parameters<typeof boxStyles>[0];

const symbolProperties = defineProperties({
  properties: {
    color: {
      accent: accentColorAsHsl,
      ...pick(semanticColorVars.foregroundColors, textColors),
    },
  },
});

export const symbolStyles = createSprinkles(symbolProperties);
export type SymbolStyles = Parameters<typeof symbolStyles>[0];

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
      accent: accentColorAsHsl,
      ...pick(semanticColorVars.foregroundColors, textColors),
    },
    fontFamily: { rounded: 'SFRounded, system-ui' },
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
    fontWeight: fontWeights,
    textAlign: ['left', 'center', 'right'],
  },
});

export const textStyles = createSprinkles(textProperties);
export type TextStyles = Parameters<typeof textStyles>[0];
