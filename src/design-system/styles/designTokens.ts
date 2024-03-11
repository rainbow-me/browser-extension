import { SFSymbolName } from '../symbols/generated/types';

export const globalColors = {
  greenA10: 'rgba(29, 184, 71, 0.1)',
  green10: '#EAFCE8',
  green20: '#CDFACD',
  green30: '#A6F5AC',
  green40: '#74E082',
  green50: '#4BD166',
  green60: '#1DB847',
  green70: '#189943',
  green80: '#09752D',
  green90: '#005723',
  green100: '#003816',

  blueA10: 'rgba(14, 118, 253, 0.1)',
  blue10: '#EDF9FF',
  blue20: '#D1EDFF',
  blue30: '#A3D7FF',
  blue40: '#6BBFFF',
  blue50: '#3898FF',
  blue60: '#0E76FD',
  blue70: '#1761E0',
  blue80: '#0B4AB8',
  blue90: '#053085',
  blue100: '#001E59',

  purpleA10: 'rgba(95, 90, 250, 0.1)',
  purple10: '#F7F5FF',
  purple20: '#E7E0FF',
  purple30: '#C6B8FF',
  purple40: '#9E8FFF',
  purple50: '#7A70FF',
  purple60: '#5F5AFA',
  purple70: '#5248E0',
  purple80: '#4936C2',
  purple90: '#38228F',
  purple100: '#2C0D6B',

  pinkA10: 'rgba(255, 92, 160, 0.1)',
  pink10: '#FFF0FA',
  pink20: '#FFD6F1',
  pink30: '#FFB8E2',
  pink40: '#FF99CF',
  pink50: '#FF7AB8',
  pink60: '#FF5CA0',
  pink70: '#E04887',
  pink80: '#CC3976',
  pink90: '#851B53',
  pink100: '#570040',

  redA10: 'rgba(250, 66, 60, 0.1)',
  red10: '#FFF0F0',
  red20: '#FFD4D1',
  red30: '#FFACA3',
  red40: '#FF887A',
  red50: '#FF6257',
  red60: '#FA423C',
  red70: '#D13732',
  red80: '#B22824',
  red90: '#7A1714',
  red100: '#520907',

  orangeA10: 'rgba(255, 128, 31, 0.1)',
  orange10: '#FFF6EB',
  orange20: '#FFE7CC',
  orange30: '#FFCF99',
  orange40: '#FFB266',
  orange50: '#FF983D',
  orange60: '#FF801F',
  orange70: '#E06E16',
  orange80: '#AD530E',
  orange90: '#703B12',
  orange100: '#3D1E0A',

  yellowA10: 'rgba(250, 203, 15, 0.1)',
  yellow10: '#FFFBE0',
  yellow20: '#FFF5C2',
  yellow30: '#FFEE99',
  yellow40: '#FFE566',
  yellow50: '#FFDF3D',
  yellow60: '#FFD014',
  yellow70: '#EBAF09',
  yellow80: '#B88700',
  yellow90: '#7A600A',
  yellow100: '#42320B',

  grey10: '#F7F7F7',
  grey20: 'rgba(9, 17, 31, 0.05)',
  grey30: 'rgba(16, 21, 31, 0.1)',
  grey40: 'rgba(16, 21, 31, 0.16)',
  grey50: 'rgba(22, 25, 31, 0.24)',
  grey60: 'rgba(26, 28, 31, 0.36)',
  grey70: 'rgba(27, 29, 31, 0.5)',
  grey80: 'rgba(27, 29, 31, 0.7)',
  grey90: 'rgba(27, 29, 31, 0.88)',
  grey100: '#000',

  white10: '#1B1C1E',
  white20: 'rgba(245, 248, 255, 0.12)',
  white30: 'rgba(245, 248, 255, 0.16)',
  white40: 'rgba(245, 248, 255, 0.2)',
  white50: 'rgba(245, 248, 255, 0.28)',
  white60: 'rgba(245, 248, 255, 0.4)',
  white70: 'rgba(245, 248, 255, 0.56)',
  white80: 'rgba(245, 248, 255, 0.76)',
  white90: 'rgba(247, 250, 255, 0.92)',
  white100: '#FFFFFF',

  blueGrey10: '#F5F5F7',
  blueGrey20: '#E6E9F0',
  blueGrey30: '#DADEE5',
  blueGrey40: '#CAD0D9',
  blueGrey50: '#AFB9C7',
  blueGrey60: '#929EAD',
  blueGrey70: '#78828F',
  blueGrey80: '#5F6670',
  blueGrey90: '#3C4047',
  blueGrey100: '#242529',

  cyan50: '#00E7F3',
};

export type ColorContext = 'light' | 'dark';

export type ContextualColorValue<Value> = {
  light: Value;
  dark: Value;
};

export type BackgroundColor =
  | 'transparent'
  | 'surfacePrimary'
  | 'surfacePrimaryElevated'
  | 'surfacePrimaryElevatedSecondary'
  | 'surfaceSecondary'
  | 'surfaceSecondaryElevated'
  | 'surfaceMenu'
  | 'fill'
  | 'fillHorizontal'
  | 'fillSecondary'
  | 'fillTertiary'
  | 'fillQuaternary'
  | 'white'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'red'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'shadowNear'
  | 'shadowFar'
  | 'separator'
  | 'separatorSecondary'
  | 'separatorTertiary'
  | 'scrim'
  | 'scrimSecondary'
  | 'scrimTertiary';

export type ButtonVariant =
  | 'raised'
  | 'flat'
  | 'tinted'
  | 'stroked'
  | 'transparent'
  | 'transparentHover'
  | 'plain'
  | 'square'
  | 'disabled'
  | 'shadow';

export const backdropFilter = {
  'blur(10px)': 'blur(10px)',
  'blur(12px)': 'blur(12px)',
  'blur(20px)': 'blur(20px)',
  'blur(26px)': 'blur(26px)',
  'blur(80px)': 'blur(80px)',
  'opacity(80%)': 'opacity(80%)',
  'opacity(5%)': 'opacity(5%)',
  'opacity(30%)': 'opacity(30%)',
  'opacity(0%)': 'opacity(0%)',
} as const;

export type BackdropFilter = keyof typeof backdropFilter;

export type BackgroundColorValue = {
  color: string;
  setColorContext: ColorContext;
};

export const backgroundColors: Record<
  BackgroundColor,
  ContextualColorValue<BackgroundColorValue>
> = {
  transparent: {
    light: {
      color: 'rgba(0, 0, 0, 0)',
      setColorContext: 'light',
    },
    dark: {
      color: 'rgba(0, 0, 0, 0)',
      setColorContext: 'dark',
    },
  },
  surfacePrimary: {
    light: {
      color: globalColors.white100,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.grey100,
      setColorContext: 'dark',
    },
  },
  surfacePrimaryElevated: {
    light: {
      color: globalColors.white100,
      setColorContext: 'light',
    },
    dark: {
      color: '#191A1C',
      setColorContext: 'dark',
    },
  },
  surfacePrimaryElevatedSecondary: {
    light: {
      color: 'rgba(245, 245, 247, 0.68)',
      setColorContext: 'light',
    },
    dark: {
      color: 'rgba(36, 37, 41, 0.4)',
      setColorContext: 'dark',
    },
  },
  surfaceSecondary: {
    light: {
      color: globalColors.blueGrey10,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.white10,
      setColorContext: 'dark',
    },
  },
  surfaceSecondaryElevated: {
    light: {
      color: globalColors.white100,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.blueGrey100,
      setColorContext: 'dark',
    },
  },
  surfaceMenu: {
    light: {
      color: 'rgba(255, 255, 255, 0.8)',
      setColorContext: 'light',
    },
    dark: {
      color: 'rgba(53, 54, 58, 0.8)',
      setColorContext: 'dark',
    },
  },
  fill: {
    light: {
      color: globalColors.grey30,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.white30,
      setColorContext: 'dark',
    },
  },
  fillHorizontal: {
    light: {
      color:
        'radial-gradient(100% 100% at 0% 50%, rgba(9, 17, 31, 0.02) 0%, rgba(9, 17, 31, 0.05) 100%)',
      setColorContext: 'light',
    },
    dark: {
      color:
        'radial-gradient(100% 100% at 0% 50%, rgba(245, 248, 255, 0.02) 0%, rgba(245, 248, 255, 0.06) 100%)',
      setColorContext: 'dark',
    },
  },
  fillSecondary: {
    light: {
      color: globalColors.grey20,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.white20,
      setColorContext: 'dark',
    },
  },
  fillTertiary: {
    light: {
      color: globalColors.grey20,
      setColorContext: 'light',
    },
    dark: {
      color: 'rgba(245, 248, 255, 0.08)',
      setColorContext: 'dark',
    },
  },
  fillQuaternary: {
    light: {
      color: globalColors.grey10,
      setColorContext: 'light',
    },
    dark: {
      color: 'rgba(245, 248, 255, 0.04)',
      setColorContext: 'dark',
    },
  },
  white: {
    light: {
      color: globalColors.white100,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.white100,
      setColorContext: 'light',
    },
  },
  blue: {
    light: {
      color: globalColors.blue60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.blue50,
      setColorContext: 'dark',
    },
  },
  cyan: {
    light: {
      color: globalColors.cyan50,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.cyan50,
      setColorContext: 'dark',
    },
  },
  green: {
    light: {
      color: globalColors.green60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.green50,
      setColorContext: 'dark',
    },
  },
  red: {
    light: {
      color: globalColors.red60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.red50,
      setColorContext: 'dark',
    },
  },
  purple: {
    light: {
      color: globalColors.purple60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.purple50,
      setColorContext: 'dark',
    },
  },
  pink: {
    light: {
      color: globalColors.pink60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.pink50,
      setColorContext: 'dark',
    },
  },
  orange: {
    light: {
      color: globalColors.orange60,
      setColorContext: 'dark',
    },
    dark: {
      color: globalColors.orange50,
      setColorContext: 'dark',
    },
  },
  yellow: {
    light: {
      color: globalColors.yellow60,
      setColorContext: 'light',
    },
    dark: {
      color: globalColors.yellow50,
      setColorContext: 'light',
    },
  },
  shadowNear: {
    dark: { color: globalColors.grey100, setColorContext: 'dark' },
    light: { color: globalColors.grey100, setColorContext: 'dark' },
  },
  shadowFar: {
    dark: { color: globalColors.grey100, setColorContext: 'dark' },
    light: { color: '#25292E', setColorContext: 'dark' },
  },
  separator: {
    light: { color: globalColors.grey20, setColorContext: 'light' },
    dark: { color: globalColors.white20, setColorContext: 'dark' },
  },
  separatorSecondary: {
    light: { color: globalColors.grey20, setColorContext: 'light' },
    dark: { color: 'rgba(245, 248, 255, 0.06)', setColorContext: 'dark' },
  },
  separatorTertiary: {
    light: { color: 'rgba(9, 17, 31, 0.02)', setColorContext: 'light' },
    dark: { color: 'rgba(245, 248, 255, 0.02)', setColorContext: 'dark' },
  },
  scrim: {
    light: {
      color: 'rgba(0, 0, 0, 0.2)',
      setColorContext: 'light',
    },
    dark: { color: 'rgba(0, 0, 0, 0.4)', setColorContext: 'dark' },
  },
  scrimSecondary: {
    light: {
      color: 'rgba(0, 0, 0, 0.4)',
      setColorContext: 'light',
    },
    dark: { color: 'rgba(0, 0, 0, 0.6)', setColorContext: 'dark' },
  },
  scrimTertiary: {
    light: {
      color: 'rgba(0, 0, 0, 0.6)',
      setColorContext: 'light',
    },
    dark: { color: 'rgba(0, 0, 0, 0.8)', setColorContext: 'dark' },
  },
};

type Cursor = 'copy' | 'default' | 'pointer' | 'text';
export const cursorOpts: Cursor[] = ['copy', 'default', 'pointer', 'text'];

type UserSelect = 'all' | 'none' | 'text';
export const userSelectOpts: UserSelect[] = ['all', 'none', 'text'];

function selectBackgroundColors<
  SelectedColors extends readonly BackgroundColor[],
>(...colors: SelectedColors): SelectedColors {
  return colors;
}

function selectBackgroundAsForeground(
  backgroundName: BackgroundColor,
): ContextualColorValue<string> {
  const bg = backgroundColors[backgroundName];

  return {
    dark: bg.dark.color,
    light: bg.light.color,
  };
}

export const buttonColors = [
  'accent',
  ...selectBackgroundColors(
    'fill',
    'fillSecondary',
    'fillTertiary',
    'surfacePrimaryElevated',
    'surfacePrimaryElevatedSecondary',
    'surfaceSecondaryElevated',
    'blue',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'yellow',
  ),
] as const;
export type ButtonColor = (typeof buttonColors)[number];

export const shadowColors = [
  'accent',
  ...selectBackgroundColors(
    'fill',
    'fillSecondary',
    'fillTertiary',
    'surfacePrimaryElevated',
    'surfacePrimaryElevatedSecondary',
    'surfaceSecondaryElevated',
    'blue',
    'green',
    'orange',
    'pink',
    'purple',
    'red',
    'yellow',
  ),
] as const;
export type ShadowColor = (typeof shadowColors)[number];

export type ForegroundColor =
  | 'label'
  | 'labelSecondary'
  | 'labelTertiary'
  | 'labelQuaternary'
  | 'labelWhite'
  | 'transparent'
  | 'blue'
  | 'cyan'
  | 'green'
  | 'red'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'fill'
  | 'fillSecondary'
  | 'fillTertiary'
  | 'fillQuaternary'
  | 'scrim'
  | 'scrimSecondary'
  | 'scrimTertiary'
  | 'separator'
  | 'separatorSecondary'
  | 'separatorTertiary'
  | 'buttonStroke'
  | 'buttonStrokeSecondary'
  | 'mainnet'
  | 'arbitrum'
  | 'optimism'
  | 'polygon'
  | 'base'
  | 'zora'
  | 'bsc'
  | 'avalanche';

export const foregroundColors: Record<
  ForegroundColor,
  ContextualColorValue<string>
> = {
  label: {
    light: globalColors.grey100,
    dark: globalColors.white100,
  },
  labelSecondary: {
    light: globalColors.grey80,
    dark: globalColors.white80,
  },
  labelTertiary: {
    light: globalColors.grey70,
    dark: globalColors.white70,
  },
  labelQuaternary: {
    light: globalColors.grey60,
    dark: globalColors.white60,
  },
  labelWhite: {
    light: globalColors.white100,
    dark: globalColors.white100,
  },
  transparent: selectBackgroundAsForeground('transparent'),
  blue: selectBackgroundAsForeground('blue'),
  cyan: selectBackgroundAsForeground('cyan'),
  green: selectBackgroundAsForeground('green'),
  red: selectBackgroundAsForeground('red'),
  purple: selectBackgroundAsForeground('purple'),
  pink: selectBackgroundAsForeground('pink'),
  orange: selectBackgroundAsForeground('orange'),
  yellow: selectBackgroundAsForeground('yellow'),
  fill: selectBackgroundAsForeground('fill'),
  fillSecondary: selectBackgroundAsForeground('fillSecondary'),
  fillTertiary: selectBackgroundAsForeground('fillTertiary'),
  fillQuaternary: selectBackgroundAsForeground('fillQuaternary'),
  separator: selectBackgroundAsForeground('separator'),
  separatorSecondary: selectBackgroundAsForeground('separatorSecondary'),
  separatorTertiary: selectBackgroundAsForeground('separatorTertiary'),
  scrim: {
    light: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.4)',
  },
  scrimSecondary: {
    light: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },
  scrimTertiary: {
    light: 'rgba(0, 0, 0, 0.6)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
  buttonStroke: {
    light: 'rgba(0, 0, 0, 0.05)',
    dark: 'rgba(255, 255, 255, 0.03)',
  },
  buttonStrokeSecondary: {
    light: globalColors.white20,
    dark: globalColors.white20,
  },
  mainnet: {
    light: '#6D6D6D',
    dark: '#999BA1',
  },
  arbitrum: {
    light: '#1690E4',
    dark: '#52B8FF',
  },
  optimism: {
    light: '#FF4040',
    dark: '#FF8A8A',
  },
  polygon: {
    light: '#8247E5',
    dark: '#BE97FF',
  },
  base: {
    light: '#0052FF',
    dark: '#3979FF',
  },
  zora: {
    light: '#2B5DF0',
    dark: '#6183F0',
  },
  bsc: {
    light: '#EBAF09',
    dark: '#FFDA66',
  },
  avalanche: {
    light: '#EBAF09',
    dark: '#FF5D5E',
  },
};

function selectForegroundColors<
  SelectedColors extends readonly ForegroundColor[],
>(...colors: SelectedColors): SelectedColors {
  return colors;
}

export const genericColors = selectForegroundColors(
  'blue',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow',
  'cyan',
);
export type GenericColor = (typeof genericColors)[number];

export const scrimColors = selectForegroundColors(
  'scrim',
  'scrimSecondary',
  'scrimTertiary',
);
export type ScrimColor = (typeof scrimColors)[number];

export const strokeColors = selectForegroundColors(
  'buttonStroke',
  'buttonStrokeSecondary',
);
export type StrokeColor = (typeof strokeColors)[number];

export const separatorColors = selectForegroundColors(
  'separator',
  'separatorSecondary',
  'separatorTertiary',
);
export type SeparatorColor = (typeof separatorColors)[number];

export const textColors = selectForegroundColors(
  'label',
  'transparent',
  'labelSecondary',
  'labelTertiary',
  'labelQuaternary',
  'labelWhite',
  'mainnet',
  'arbitrum',
  'optimism',
  'polygon',
  'base',
  'zora',
  'bsc',
  'avalanche',
  ...genericColors,
);
export type TextColor = (typeof textColors)[number];

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
} as const;
export type FontWeight = keyof typeof fontWeights;

export const linearGradients = {
  rainbow:
    'radial-gradient(100% 276.79% at 100% 49.98%, #FFB114 0%, #FF54BB 63.54%, #00F0FF 100%)',
  points: `
    radial-gradient(80.71% 706.25% at 23.21% 100%, #00BFC6 0%, #00EE45 25%, #FFD400 50%, #F24527 75%, #C54EAB 100%),
    radial-gradient(80.71% 706.25% at 23.21% 100%, color(display-p3 0.192 0.737 0.769) 0%, color(display-p3 0.341 0.918 0.373) 25%, color(display-p3 1.000 0.839 0.000) 50%, color(display-p3 0.875 0.325 0.216) 75%, color(display-p3 0.718 0.337 0.655) 100%),
    linear-gradient(0deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)),
    linear-gradient(0deg, color(display-p3 1.000 1.000 1.000 / 0.12), color(display-p3 1.000 1.000 1.000 / 0.12))
  `,
  ['🥇']: `
    linear-gradient(90deg, #FFE329 0%, #DA9200 100%),
    linear-gradient(90deg, color(display-p3 1.000 0.894 0.337) 0%, color(display-p3 0.812 0.584 0.000) 100%)
  `,
  ['🥈']: `
    linear-gradient(90deg, #D0DBE7 0%, #B1BCC8 100%),
    linear-gradient(90deg, color(display-p3 0.82 0.86 0.91) 0%, color(display-p3 0.702 0.737 0.780) 100%)
  `,
  ['🥉']: `
    linear-gradient(90deg, #EB8A15 0%, #BA5A0A 100%),
    linear-gradient(90deg, color(display-p3 0.871 0.561 0.220) 0%, color(display-p3 0.682 0.373 0.145) 100%)
  `,
} as const;
export type LinearGradient = keyof typeof linearGradients;

export const space = {
  '0px': 0,
  '1px': 1,
  '1.5px': 1.5,
  '2px': 2,
  '3px': 3,
  '4px': 4,
  '5px': 5,
  '6px': 6,
  '7px': 7,
  '8px': 8,
  '9px': 9,
  '10px': 10,
  '12px': 12,
  '14px': 14,
  '15px': 15,
  '16px': 16,
  '18px': 18,
  '19px': 19,
  '20px': 20,
  '22px': 22,
  '24px': 24,
  '28px': 28,
  '26px': 26,
  '27px': 27,
  '30px': 30,
  '32px': 32,
  '34px': 34,
  '35px': 35,
  '36px': 36,
  '40px': 40,
  '44px': 44,
  '48px': 48,
  '50px': 50,
  '52px': 52,
  '60px': 60,
  '64px': 64,
  '65px': 65,
  '68px': 68,
  '72px': 72,
  '80px': 80,
  '100px': 100,
  '104px': 104,
  '120px': 120,
} as const;

export const negativeSpace = {
  '-0px': 0,
  '-1px': -1,
  '-1.5px': -1.5,
  '-2px': -2,
  '-3px': -3,
  '-4px': -4,
  '-5px': -5,
  '-6px': -6,
  '-7px': -7,
  '-8px': -8,
  '-9px': -9,
  '-10px': -10,
  '-12px': -12,
  '-14px': -14,
  '-15px': -15,
  '-16px': -16,
  '-18px': -18,
  '-19px': -19,
  '-20px': -20,
  '-22px': -22,
  '-24px': -24,
  '-26px': -26,
  '-27px': -27,
  '-28px': -28,
  '-30px': -30,
  '-32px': -32,
  '-34px': -34,
  '-35px': -35,
  '-36px': -36,
  '-40px': -40,
  '-48px': -48,
  '-44px': -44,
  '-50px': -50,
  '-52px': -52,
  '-60px': -60,
  '-64px': -64,
  '-65px': -65,
  '-68px': -68,
  '-72px': -72,
  '-80px': -80,
  '-100px': -100,
  '-104px': -104,
  '-120px': -120,
} as const;

export const spaceToNegativeSpace: Record<
  keyof typeof space,
  keyof typeof negativeSpace
> = {
  '0px': '-0px',
  '1px': '-1px',
  '1.5px': '-1.5px',
  '2px': '-2px',
  '3px': '-3px',
  '4px': '-4px',
  '5px': '-5px',
  '6px': '-6px',
  '7px': '-7px',
  '8px': '-8px',
  '9px': '-9px',
  '10px': '-10px',
  '12px': '-12px',
  '14px': '-14px',
  '15px': '-15px',
  '16px': '-16px',
  '18px': '-18px',
  '19px': '-19px',
  '20px': '-20px',
  '22px': '-22px',
  '24px': '-24px',
  '26px': '-26px',
  '27px': '-27px',
  '28px': '-28px',
  '30px': '-30px',
  '32px': '-32px',
  '34px': '-34px',
  '35px': '-35px',
  '36px': '-36px',
  '40px': '-40px',
  '44px': '-44px',
  '48px': '-48px',
  '50px': '-50px',
  '52px': '-52px',
  '60px': '-60px',
  '64px': '-64px',
  '65px': '-65px',
  '68px': '-68px',
  '72px': '-72px',
  '80px': '-80px',
  '100px': '-100px',
  '104px': '-104px',
  '120px': '-120px',
};

export const positionSpace = {
  '0': 0,
  '8px': '8px',
  '16px': '16px',
} as const;

export type Space = keyof typeof space;
export type NegativeSpace = keyof typeof negativeSpace;
export type PositionSpace = keyof typeof positionSpace;

export function negateSpace(space: Space): NegativeSpace {
  return spaceToNegativeSpace[space];
}

export const transformScales = {
  '1.04': 1.04,
  '0.96': 0.96,
} as const;
export type TransformScale = keyof typeof transformScales;

export const transitions = {
  bounce: { type: 'spring', mass: 0.1, stiffness: 500, damping: 20 },
} as const;
export type Transition = keyof typeof transitions;

export const strokeWeights = {
  '0px': 0,
  '0.5px': 0.5,
  '1px': 1,
  '1.5px': 1.5,
  '2px': 2,
  '3px': 3,
};
export type StrokeWeight = keyof typeof strokeWeights;

function selectSymbolNames<SymbolName extends readonly SFSymbolName[]>(
  ...symbolNames: SymbolName
): SymbolName {
  return symbolNames;
}

// Note: Don't forget to generate the symbols with `yarn ds:generate-symbols`!
export const symbolNames = selectSymbolNames(
  'chevron.down',
  'chevron.down.circle',
  'arrow.left',
  'app.badge.checkmark',
  'ellipsis',
  'xmark',
  'checkmark',
  'square.on.square.dashed',
  'gearshape.fill',
  'qrcode',
  'person.crop.circle.fill',
  'person.crop.circle.fill.badge.plus',
  'binoculars.fill',
  'circle.fill',
  'circle',
  'checkmark.circle.fill',
  'record.circle.fill',
  'bolt',
  'bolt.fill',
  'rectangle.and.hand.point.up.left.filled',
  'xmark.circle',
  'paperplane.fill',
  'moon.stars',
  'lock.fill',
  'checkmark.circle.fill',
  'eurosign.circle',
  'sun.max',
  'sun.max.fill',
  'moon',
  'gear',
  'chevron.right',
  'chevron.up.chevron.down',
  'eye.slash.circle.fill',
  'person.text.rectangle.fill',
  'arrow.triangle.swap',
  'arrow.up',
  'arrow.down',
  'square.on.square',
  'slider.horizontal.3',
  'arrow.down.forward',
  'arrow.up.forward.circle',
  'arrow.up.forward',
  'arrow.up.arrow.down',
  'arrow.right',
  'eye',
  'eye.slash.fill',
  'eyes',
  'eyes.inverse',
  'exclamationmark.triangle.fill',
  'exclamationmark.triangle',
  'highlighter',
  'lock.open.fill',
  'lock.square.fill',
  'lock.square.stack.fill',
  'plus.circle.fill',
  'ellipsis.circle',
  'key.fill',
  'doc.plaintext',
  'doc.on.doc',
  'checkmark.shield.fill',
  'checkmark.seal.fill',
  'lock.rotation',
  'doc.text.magnifyingglass',
  'magnifyingglass',
  'magnifyingglass.circle',
  'arrow.uturn.down.circle.fill',
  'lifepreserver',
  'doc.plaintext.fill',
  'magnifyingglass.circle.fill',
  'doc.on.doc.fill',
  'trash',
  'wand.and.stars',
  'wand.and.stars.inverse',
  'network',
  'command',
  'asterisk',
  'info.circle.fill',
  'info.circle',
  'info',
  'app.connected.to.app.below.fill',
  'trash.fill',
  'plus.circle',
  'shield.righthalf.filled',
  'square.dashed',
  'sparkle',
  'xmark.circle.fill',
  'switch.2',
  'network',
  'star.fill',
  'exclamationmark.circle.fill',
  'shuffle',
  'chart.bar.xaxis',
  'arrow.2.squarepath',
  'person.crop.circle.badge.xmark',
  'person.crop.circle.badge.checkmark',
  'return.left',
  'plus',
  'book.closed.fill',
  'message.fill',
  'ellipsis.rectangle',
  'eye.fill',
  'dollarsign.square',
  'clock.arrow.circlepath',
  'chart.line.uptrend.xyaxis',
  'chart.pie',
  'chart.bar',
  'person',
  'point.3.filled.connected.trianglepath.dotted',
  'person.crop.rectangle.stack.fill',
  'plus.app.fill',
  'arrow.up.left.and.arrow.down.right',
  'safari',
  'link',
  'arrow.down.circle',
  'number',
  'clock.badge.checkmark',
  'clock',
  'number.square',
  'barometer',
  'fuelpump.fill',
  'tag',
  'checkmark.circle',
  'flame',
  'gift',
  'shippingbox',
  'plus.app',
  'sparkle',
  'bag',
  'arrow.turn.up.right',
  'square.stack.3d.up',
  'minus.circle',
  'hare',
  'arrow.turn.left.down',
  'arrow.turn.right.down',
  'arrow.turn.right.up',
  'cable.connector',
  'person.fill.viewfinder',
  'circlebadge.2.fill',
  'xmark.bin.fill',
  'globe',
  'square.grid.2x2',
  '123.rectangle.fill',
  'clock.arrow.2.circlepath',
  'speaker.wave.2.fill',
  'creditcard',
  'creditcard.fill',
  'building.columns',
  'paintbrush.pointed.fill',
  'exclamationmark.octagon.fill',
  'network.badge.shield.half.filled',
  'safari.fill',
  'bolt.shield',
  'bolt.shield.fill',
  'arrow.up.circle.fill',
  'curlybraces',
  'calendar',
  'signature',
  'waveform.badge.magnifyingglass',
  'arrow.down.right.and.arrow.up.left',
  't.square.fill',
  'arcade.stick',
  'hammer.fill',
  'checklist.unchecked',
  'list.bullet',
  'square.and.arrow.up',
  'arrow.down.circle.fill',
  'arrow.up.right.circle',
  'arrow.up.right.square.fill',
  'at.circle.fill',
  'ellipsis.bubble.fill',
  'percent',
  'photo',
  'person.crop.rectangle.fill',
  'photo.fill',
  'spigot.fill',
  'person.2.fill',
  'chart.line.flattrend.xyaxis',
  'chart.line.uptrend.xyaxis',
  'chart.line.downtrend.xyaxis',
  'dollarsign.circle',
  'square.grid.2x2.fill',
  'pin.fill',
  'cable.connector.slash',
);
export type SymbolName = (typeof symbolNames)[number];

export const radii = {
  round: 9999,
  '0': 0,
  '2px': 2,
  '3px': 3,
  '4px': 4,
  '5px': 5,
  '6px': 6,
  '7px': 7,
  '8px': 8,
  '9px': 9,
  '10px': 10,
  '12px': 12,
  '14px': 14,
  '16px': 16,
  '18px': 18,
  '20px': 20,
  '24px': 24,
  '26px': 26,
  '28px': 28,
  '30px': 30,
  '32px': 32,
  '40px': 40,
};
export type Radius = keyof typeof radii;

export type AnimatedRouteDirection =
  | 'base'
  | 'right'
  | 'left'
  | 'up'
  | 'upRight'
  | 'down'
  | 'deceleratedShort'
  | 'emphasizedShort';
export type AnimatedRouteBreakpoints = 'initial' | 'end' | 'exit';
export type AnimatedAttributes = {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
};
export type AnimatedRouteConfig = Record<
  AnimatedRouteBreakpoints,
  AnimatedAttributes
>;

export const animatedRouteTransitionConfig = {
  base: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  right: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  left: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  up: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  upRight: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  down: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  deceleratedShort: {
    ease: [0, 0, 0, 1],
    duration: 0.18,
  },
  emphasizedShort: {
    ease: [0.2, 0, 0, 1],
    duration: 0.2,
  },
};
