import { createStyleObject as capsize } from '@capsizecss/core';
import {
  assignVars,
  createThemeContract,
  createVar,
  globalFontFace,
  globalStyle,
  style,
} from '@vanilla-extract/css';
import type { CSSVarFunction, MapLeafNodes } from '@vanilla-extract/private';
import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';
import chroma from 'chroma-js';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';

import {
  BackgroundColor,
  ColorContext,
  ForegroundColor,
  ShadowColor,
  TextColor,
  backdropFilter,
  backgroundColors,
  buttonColors,
  cursorOpts,
  fontWeights,
  foregroundColors,
  linearGradients,
  negativeSpace,
  positionSpace,
  radii,
  separatorColors,
  shadowColors,
  space,
  strokeColors,
  strokeWeights,
  textColors,
  userSelectOpts,
} from './designTokens';
import SFMonoBold from './fonts/SFMono-bold.woff2';
import SFMonoSemibold from './fonts/SFMono-semibold.woff2';
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

export const avatarColorHslVars = createThemeContract({
  hue: null,
  saturation: null,
  lightness: null,
});

export type HslVars = MapLeafNodes<
  { hue: null; saturation: null; lightness: null },
  CSSVarFunction
>;

const getColorAsHsl = ({ alpha, vars }: { alpha?: number; vars: HslVars }) =>
  `hsl(${[
    vars.hue,
    vars.saturation,
    vars.lightness,
    ...(alpha !== undefined ? [alpha] : []),
  ].join(', ')})`;

export const accentColorAsHsl = getColorAsHsl({ vars: accentColorHslVars });
export const semiTransparentAccentColorAsHsl = getColorAsHsl({
  alpha: 0.8,
  vars: accentColorHslVars,
});
export const transparentAccentColorAsHsl = getColorAsHsl({
  alpha: 0.1,
  vars: accentColorHslVars,
});

export const transparentAccentColorAsHsl20 = getColorAsHsl({
  alpha: 0.2,
  vars: accentColorHslVars,
});

export const transparentAccentColorAsHsl60 = getColorAsHsl({
  alpha: 0.6,
  vars: accentColorHslVars,
});

export const avatarColorAsHsl = getColorAsHsl({ vars: avatarColorHslVars });
export const transparentAvatarColorAsHsl = getColorAsHsl({
  alpha: 0.1,
  vars: avatarColorHslVars,
});

export const semanticColorVars = createThemeContract({
  backgroundColors: mapValues(backgroundColors, () => null),
  foregroundColors: mapValues(foregroundColors, () => null),
});

export const foregroundColorVars = semanticColorVars.foregroundColors;
export const backgroundColorsVars = semanticColorVars.backgroundColors;

interface ShadowDefinition {
  dark: string;
  light: string;
}

export type ShadowSize = '1px' | '12px' | '18px' | '24px' | '30px';
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
    ? getColorAsHsl({ alpha, vars: accentColorHslVars })
    : chroma(backgroundColors[color][theme].color).alpha(alpha).css();
}

const shadowTokens: Record<Shadow, ShadowDefinition> = {
  '1px': {
    light: [`0 1px 0 ${getShadowColor('shadowFar', 'light', 0.2)}`].join(', '),
    dark: [`0 1px 0 ${getShadowColor('shadowFar', 'dark', 0.2)}`].join(', '),
  },
  ...coloredShadows('1px', (color) => ({
    light: [`0 1px 0 ${getShadowColor(color, 'light', 0.2)}`].join(', '),
    dark: [`0 1px 0 ${getShadowColor('shadowFar', 'dark', 0.2)}`].join(', '),
  })),
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

function getTextShadowColor(
  color: 'accent' | ForegroundColor,
  theme: ColorContext,
  alpha: number,
) {
  return color === 'accent'
    ? getColorAsHsl({ alpha, vars: accentColorHslVars })
    : chroma(foregroundColors[color][theme]).alpha(alpha).css();
}

function coloredTextShadows<Size extends ShadowSize>(
  size: Size,
  getShadowForColor: (color: TextColor | 'accent') => ShadowDefinition,
): Record<`${Size} ${TextColor | 'accent'}`, ShadowDefinition> {
  return Object.assign(
    {},
    ...([...textColors, 'accent'] as const).map((color) => ({
      [`${size} ${color}`]: getShadowForColor(color),
    })),
  );
}

const textShadowTokens = {
  ...coloredTextShadows('12px', (color) => ({
    light: `0 0px 12px ${getTextShadowColor(color, 'light', 0.6)}`,
    dark: `0 0px 12px ${getTextShadowColor(color, 'dark', 0.8)}`,
  })),
  '12px label': {
    light: `0px 0px 12px rgba(27, 29, 31, 0.45)`,
    dark: `0px 0px 12px rgba(244, 248, 255, 0.45)`,
  },
};

export const textShadowVars = createThemeContract(
  mapValues(textShadowTokens, () => null),
);

export const textShadows = Object.keys(
  textShadowVars,
) as (keyof typeof textShadowVars)[];

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
      ...assignVars(
        textShadowVars,
        mapValues(textShadowTokens, (x) => x.dark),
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
      ...assignVars(
        textShadowVars,
        mapValues(textShadowTokens, (x) => x.dark),
      ),
    },
  },
);

export const gapVar = createVar();

const boxBaseProperties = defineProperties({
  properties: {
    alignItems: ['stretch', 'flex-start', 'center', 'flex-end'],
    backdropFilter: backdropFilter,
    borderRadius: radii,
    borderWidth: mapValues(strokeWeights, (borderWidth) => ({
      borderStyle: 'solid',
      borderWidth,
    })),
    borderBottomWidth: mapValues(strokeWeights, (borderWidth) => ({
      borderStyle: 'solid',
      borderWidth,
    })),
    bottom: positionSpace,
    cursor: cursorOpts,
    display: ['none', 'flex', 'block', 'inline'],
    flexDirection: ['row', 'column', 'column-reverse', 'row-reverse'],
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
    opacity: ['1', '0', '0.04', '0.1', '0.2', '0.5', '0.6', '0.75'],
    outline: ['none'],
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
    active: { selector: '&:active' },
    default: {},
    focus: { selector: '&:focus' },
    focusVisible: { selector: '&:focus-visible' },
    hover: { selector: '&:hover' },
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
        'labelSecondary',
        'labelTertiary',
        'labelQuaternary',
        ...separatorColors,
        ...strokeColors,
      ] as const),
      ...pick(semanticColorVars.backgroundColors, [
        ...buttonColors,
        'surfaceSecondary',
      ] as const),
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
    filter: {
      'shadow 12px accent': `drop-shadow(${textShadowTokens['12px accent'].light})`,
      'shadow 12px red': `drop-shadow(${textShadowTokens['12px red'].light})`,
      'shadow 12px yellow': `drop-shadow(${textShadowTokens['12px yellow'].light})`,
      'shadow 12px green': `drop-shadow(${textShadowTokens['12px green'].light})`,
    },
    cursor: cursorOpts,
    opacity: {
      boxed: 0.76,
      default: 1,
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
    fontDisplay: 'block',
  });
});

[
  [SFMonoSemibold, 600],
  [SFMonoBold, 700],
].forEach(([fontPath, fontWeight]) => {
  globalFontFace('SFMono', {
    src: `url('${fontPath}') format('woff2')`,
    fontWeight,
    fontStyle: 'normal',
    fontDisplay: 'block',
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
    cursor: cursorOpts,
    fontFamily: { rounded: 'SFRounded, system-ui', mono: 'SFMono' },
    fontSize: {
      '7pt': defineType(7, 11, 0.64),
      '9pt': defineType(9, 11, 0.56),
      '10pt': defineType(10, 12, 0.6),
      '11pt': defineType(11, 13, 0.56),
      '12pt': defineType(12, 15, 0.52),
      '14pt': defineType(14, 19, 0.48),
      '14pt mono': defineType(14, 19, 0),
      '14pt / 135%': defineType(14, '135%', 0.48),
      '14pt / 155%': defineType(14, '150%', 0.48),
      '15pt': defineType(15, 20, 0.41),
      '16pt': defineType(16, 21, 0.35),
      '16pt / 135%': defineType(16, '135%', 0.35),
      '16pt / 155%': defineType(16, '150%', 0.35),
      '20pt': defineType(20, 25, 0.36),
      '20pt / 135%': defineType(20, '135%', 0.36),
      '20pt / 150%': defineType(20, '150%', 0.36),
      '23pt': defineType(23, 29, 0.35),
      '26pt': defineType(26, 32, 0.36),
      '32pt': defineType(32, 40, 0.41),
      '44pt': defineType(44, 44, 0.41),
      '13pt (Non-Standard)': defineType(13, 17, 0.5),
    },
    fontWeight: fontWeights,
    textAlign: ['left', 'center', 'right'],
    background: linearGradients,
    WebkitBackgroundClip: ['border-box', 'text'],
    userSelect: userSelectOpts,
    textOverflow: ['ellipsis'],
    whiteSpace: ['nowrap', 'pre-wrap'],
    overflow: ['hidden'],
    transition: ['color 200ms ease-out, text-shadow 1s ease'],
    textShadow: textShadowVars,
  },
});

export const textStyles = createSprinkles(textProperties);
export type TextStyles = Parameters<typeof textStyles>[0];
