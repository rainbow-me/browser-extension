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
  | 'fillSecondary'
  | 'white'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'shadowNear'
  | 'shadowFar';

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
};

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
export type ButtonColor = typeof buttonColors[number];

export const shadowColors = [
  'accent',
  ...selectBackgroundColors(
    'fill',
    'fillSecondary',
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
export type ShadowColor = typeof shadowColors[number];

export type ForegroundColor =
  | 'label'
  | 'labelSecondary'
  | 'labelTertiary'
  | 'labelQuaternary'
  | 'transparent'
  | 'blue'
  | 'green'
  | 'red'
  | 'purple'
  | 'pink'
  | 'orange'
  | 'yellow'
  | 'fill'
  | 'fillSecondary'
  | 'scrim'
  | 'scrimSecondary'
  | 'scrimTertiary'
  | 'separator'
  | 'separatorSecondary'
  | 'separatorTertiary'
  | 'buttonStroke'
  | 'buttonStrokeSecondary';

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
  transparent: selectBackgroundAsForeground('transparent'),
  blue: selectBackgroundAsForeground('blue'),
  green: selectBackgroundAsForeground('green'),
  red: selectBackgroundAsForeground('red'),
  purple: selectBackgroundAsForeground('purple'),
  pink: selectBackgroundAsForeground('pink'),
  orange: selectBackgroundAsForeground('orange'),
  yellow: selectBackgroundAsForeground('yellow'),
  fill: selectBackgroundAsForeground('fill'),
  fillSecondary: selectBackgroundAsForeground('fillSecondary'),
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
  separator: {
    light: globalColors.grey20,
    dark: globalColors.white20,
  },
  separatorSecondary: {
    light: globalColors.grey20,
    dark: 'rgba(245, 248, 255, 0.06)',
  },
  separatorTertiary: {
    light: 'rgba(9, 17, 31, 0.02)',
    dark: 'rgba(245, 248, 255, 0.02)',
  },
  buttonStroke: {
    light: 'rgba(0, 0, 0, 0.05)',
    dark: 'rgba(255, 255, 255, 0.03)',
  },
  buttonStrokeSecondary: {
    light: globalColors.white20,
    dark: globalColors.white20,
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
);
export type GenericColor = typeof genericColors[number];

export const scrimColors = selectForegroundColors(
  'scrim',
  'scrimSecondary',
  'scrimTertiary',
);
export type ScrimColor = typeof scrimColors[number];

export const strokeColors = selectForegroundColors(
  'buttonStroke',
  'buttonStrokeSecondary',
);
export type StrokeColor = typeof strokeColors[number];

export const separatorColors = selectForegroundColors(
  'separator',
  'separatorSecondary',
  'separatorTertiary',
);
export type SeparatorColor = typeof separatorColors[number];

export const textColors = selectForegroundColors(
  'label',
  'transparent',
  'labelSecondary',
  'labelTertiary',
  'labelQuaternary',
  ...genericColors,
);
export type TextColor = typeof textColors[number];

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  heavy: 800,
} as const;
export type FontWeight = keyof typeof fontWeights;

export const space = {
  '2px': 2,
  '3px': 3,
  '4px': 4,
  '5px': 5,
  '6px': 6,
  '8px': 8,
  '10px': 10,
  '12px': 12,
  '14px': 14,
  '16px': 16,
  '20px': 20,
  '24px': 24,
  '28px': 28,
  '30px': 30,
  '32px': 32,
  '36px': 36,
  '40px': 40,
  '44px': 44,
  '50px': 50,
  '52px': 52,
  '60px': 60,
  '64px': 64,
  '72px': 72,
  '80px': 80,
  '104px': 104,
} as const;

export const negativeSpace = {
  '-1px': -1,
  '-2px': -2,
  '-3px': -3,
  '-4px': -4,
  '-5px': -5,
  '-6px': -6,
  '-8px': -8,
  '-10px': -10,
  '-12px': -12,
  '-14px': -14,
  '-16px': -16,
  '-20px': -20,
  '-24px': -24,
  '-28px': -28,
  '-30px': -30,
  '-32px': -32,
  '-36px': -36,
  '-40px': -40,
  '-44px': -44,
  '-50px': -50,
  '-52px': -52,
  '-60px': -60,
  '-64px': -64,
  '-72px': -72,
  '-80px': -80,
  '-104px': -104,
} as const;

export const spaceToNegativeSpace: Record<
  keyof typeof space,
  keyof typeof negativeSpace
> = {
  '2px': '-2px',
  '3px': '-3px',
  '4px': '-4px',
  '5px': '-5px',
  '6px': '-6px',
  '8px': '-8px',
  '10px': '-10px',
  '12px': '-12px',
  '14px': '-14px',
  '16px': '-16px',
  '20px': '-20px',
  '24px': '-24px',
  '28px': '-28px',
  '30px': '-30px',
  '32px': '-32px',
  '36px': '-36px',
  '40px': '-40px',
  '44px': '-44px',
  '50px': '-50px',
  '52px': '-52px',
  '60px': '-60px',
  '64px': '-64px',
  '72px': '-72px',
  '80px': '-80px',
  '104px': '-104px',
};

export const positionSpace = {
  '0': 0,
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
  '1px': 1,
  '2px': 2,
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
  'checkmark.circle.fill',
  'record.circle.fill',
  'bolt.fill',
  'rectangle.and.hand.point.up.left.filled',
  'xmark.circle',
  'paperplane.fill',
  'moon.stars',
  'lock.fill',
  'checkmark.circle.fill',
  'eurosign.circle',
  'sun.max',
  'moon',
  'gear',
  'chevron.right',
  'chevron.up.chevron.down',
  'eye.slash.circle.fill',
  'person.text.rectangle.fill',
  'arrow.triangle.swap',
  'arrow.down',
  'square.on.square',
  'slider.horizontal.3',
  'arrow.up.forward.circle',
  'arrow.up.arrow.down',
  'arrow.right',
  'eye',
  'eye.slash.fill',
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
  'lock.rotation',
  'doc.text.magnifyingglass',
  'magnifyingglass.circle',
  'arrow.uturn.down.circle.fill',
  'lifepreserver',
  'doc.plaintext.fill',
  'magnifyingglass.circle.fill',
  'doc.on.doc.fill',
  'trash',
);
export type SymbolName = typeof symbolNames[number];

export const radii = {
  round: 9999,
  '3px': 3,
  '6px': 6,
  '8px': 8,
  '9px': 9,
  '12px': 12,
  '14px': 14,
  '16px': 16,
  '18px': 18,
  '20px': 20,
  '24px': 24,
  '28px': 28,
  '30px': 30,
  '32px': 32,
};
export type Radius = keyof typeof radii;

export type AnimatedRouteDirection = 'base' | 'horizontal' | 'vertical';
export type AnimatedRouteBreakpoints = 'initial' | 'end' | 'exit';
export type AnimatedAttributes = {
  opacity?: number;
  x?: number;
  y?: number;
};
export type AnimatedRouteConfig = Record<
  AnimatedRouteBreakpoints,
  AnimatedAttributes
>;

export const animatedRouteTransitionConfig = {
  base: {
    type: 'spring',
    duration: 0.3,
  },
  horizontal: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
  vertical: {
    type: 'spring',
    stiffness: 1111,
    damping: 50,
    mass: 1,
  },
};
