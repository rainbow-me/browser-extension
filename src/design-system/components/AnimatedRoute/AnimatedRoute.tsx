import { motion } from 'framer-motion';
import React, {
  RefObject,
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';

import { useCurrentAddressStore } from '~/core/state';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import {
  POPUP_DIMENSIONS,
  TESTNET_MODE_BAR_HEIGHT,
} from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import {
  AnimatedRouteConfig,
  AnimatedRouteDirection,
  BackgroundColor,
  animatedRouteTransitionConfig,
  globalColors,
} from '~/design-system/styles/designTokens';
import { ProtectedRoute } from '~/entries/popup/ProtectedRoute';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { shouldShowTestnetBar } from '~/entries/popup/components/TestnetMode/TestnetBar/TestnetBar';
import { UserStatusResult } from '~/entries/popup/hooks/useAuth';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';
import { getActiveElement } from '~/entries/popup/utils/activeElement';
import { mergeRefs } from '~/entries/popup/utils/mergeRefs';

import { AccentColorProvider, AvatarColorProvider } from '../Box/ColorContext';

import {
  animatedRouteStyles,
  animatedRouteTestnetModeStyles,
} from './AnimatedRoute.css';

type AnimatedRouteProps = {
  background?: BackgroundColor;
  children: React.ReactNode;
  direction: AnimatedRouteDirection;
  navbar?: boolean;
  navbarIcon?: 'arrow' | 'ex';
  navbarBackground?: BackgroundColor;
  title?: string;
  protectedRoute?: UserStatusResult[] | true;
  rightNavbarComponent?: React.ReactElement;
  accentColor?: boolean;
};

export const animatedRouteValues: Record<
  AnimatedRouteDirection,
  AnimatedRouteConfig
> = {
  base: {
    initial: {
      opacity: 0,
      y: 0,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -16,
    },
  },
  right: {
    initial: {
      opacity: 0,
      x: 16,
    },
    end: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -16,
    },
  },
  left: {
    initial: {
      opacity: 0,
      x: -16,
    },
    end: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 16,
    },
  },
  up: {
    initial: {
      opacity: 0,
      y: 16,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -16,
    },
  },
  upRight: {
    initial: {
      opacity: 0,
      x: 0,
      y: 16,
    },
    end: {
      opacity: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      x: -16,
      y: 0,
    },
  },
  down: {
    initial: {
      opacity: 0,
      y: -16,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 16,
    },
  },
  deceleratedShort: {
    initial: {
      opacity: 0,
      scale: 1.1,
    },
    end: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
    },
  },
  emphasizedShort: {
    initial: {
      opacity: 0,
    },
    end: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  },
};

const containerRefContext = createContext<RefObject<HTMLDivElement>>({
  current: null,
});
export const useContainerRef = () => useContext(containerRefContext);

export const AnimatedRoute = forwardRef((props: AnimatedRouteProps, ref) => {
  const {
    background,
    children,
    direction,
    navbar,
    navbarIcon,
    title,
    navbarBackground,
    protectedRoute,
    rightNavbarComponent,
    accentColor = true,
  } = props;
  const { state } = useLocation();
  const { testnetMode } = useTestnetModeStore();
  const location = useLocation();
  const animationDirection: AnimatedRouteDirection =
    state?.direction ?? direction;
  const { initial, end, exit } = animatedRouteValues[animationDirection];
  const transition = animatedRouteTransitionConfig[animationDirection];

  const navigationType = useNavigationType();
  const isBack =
    (navigationType === 'POP' && state?.isBack !== false) || state?.isBack;

  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });
  const [urlSearchParams] = useSearchParams();
  const hideBackButton = urlSearchParams.get('hideBack') === 'true';

  const leftNavbarIcon = useMemo(() => {
    if (hideBackButton) return undefined;
    const icon = state?.navbarIcon || navbarIcon;
    if (icon === 'arrow' || icon === 'ex') {
      return icon === 'arrow' ? <Navbar.BackButton /> : <Navbar.CloseButton />;
    } else return undefined;
  }, [hideBackButton, navbarIcon, state?.navbarIcon]);

  useEffect(() => {
    const app = document.getElementById('app');
    setTimeout(() => {
      if (getActiveElement()?.tagName === 'BODY') {
        app?.focus();
      }
    }, 150);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const content = (
    <AccentColorProvider
      color={accentColor ? avatar?.color : globalColors.blue60}
    >
      <AvatarColorProvider color={avatar?.color || globalColors.blue60}>
        <containerRefContext.Provider value={containerRef}>
          <Box
            as={motion.div}
            ref={mergeRefs(ref, containerRef)}
            display="flex"
            flexDirection="column"
            height="full"
            initial={isBack ? exit : initial}
            style={{
              overflow: 'auto',
              maxHeight:
                POPUP_DIMENSIONS.height -
                (shouldShowTestnetBar({
                  testnetMode,
                  pathname: location.pathname,
                })
                  ? TESTNET_MODE_BAR_HEIGHT
                  : 0),
            }}
            animate={end}
            exit={isBack ? initial : exit}
            transition={transition}
            background={background}
            className={
              shouldShowTestnetBar({
                testnetMode,
                pathname: location.pathname,
              })
                ? animatedRouteTestnetModeStyles
                : animatedRouteStyles
            }
          >
            {navbar && (
              <Navbar
                title={state?.title || title || ''}
                background={navbarBackground}
                leftComponent={leftNavbarIcon}
                rightComponent={rightNavbarComponent}
              />
            )}
            {children}
          </Box>
        </containerRefContext.Provider>
      </AvatarColorProvider>
    </AccentColorProvider>
  );

  if (protectedRoute) {
    return (
      <ProtectedRoute allowedStates={protectedRoute}>{content}</ProtectedRoute>
    );
  }
  return content;
});

AnimatedRoute.displayName = 'AnimatedRoute';
