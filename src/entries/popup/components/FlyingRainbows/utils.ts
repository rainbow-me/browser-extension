import { Transition } from 'framer-motion';

export type FlyingRainbowsScreen = 'welcome';
export type RainbowType =
  | 'rainbowPixel'
  | 'rainbowWhite'
  | 'rainbowOg'
  | 'rainbowLight'
  | 'rainbowNeon';

export const RAINBOW_POSITION: {
  [key in RainbowType]: {
    [key in FlyingRainbowsScreen]: {
      left?: string;
      right?: string;
      top?: string;
      bottom?: string;
    };
  };
} = {
  rainbowPixel: {
    welcome: {
      left: '207.36px',
      top: '-77px',
    },
  },
  rainbowWhite: {
    welcome: {
      left: '-33.98px',
      top: '-4.21px',
    },
  },
  rainbowOg: {
    welcome: {
      left: '-46.1px',
      top: '378.17px',
    },
  },
  rainbowLight: {
    welcome: {
      left: '120.92px',
      top: '385.78px',
    },
  },
  rainbowNeon: {
    welcome: {
      left: '234.12px',
      top: '549.4px',
    },
  },
};

export const RAINBOW_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 100,
  damping: 15,
  mass: 1,
};

export const RAINBOW_STYLE: {
  [key in RainbowType]: {
    width?: string;
    height?: string;
    rotate?: string;
  };
} = {
  rainbowPixel: {
    width: '225.17px',
    height: '225.17px',
  },
  rainbowWhite: {
    width: '171.34px',
    height: '171.34px',
    rotate: '150deg',
  },
  rainbowOg: {
    height: '95.58px',
    width: '95.58px',
    rotate: '-33.07deg',
  },
  rainbowLight: {
    width: '142.69px',
    height: '142.69px',
    rotate: '75deg',
  },
  rainbowNeon: {
    width: '112.58px',
    height: '112.58px',
    rotate: '34.75deg',
  },
};
