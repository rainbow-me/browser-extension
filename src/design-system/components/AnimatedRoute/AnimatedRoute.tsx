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
import { useLocation, useNavigationType } from 'react-router-dom';

import { useCurrentAddressStore } from '~/core/state';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
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
import { UserStatusResult } from '~/entries/popup/hooks/useAuth';
import { useAvatar } from '~/entries/popup/hooks/useAvatar';
import { getInputIsFocused } from '~/entries/popup/utils/activeElement';
import { mergeRefs } from '~/entries/popup/utils/mergeRefs';

import {
  AccentColorProviderWrapper,
  AvatarColorProvider,
} from '../Box/ColorContext';

import { animatedRouteStyles } from './AnimatedRoute.css';

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
  const { initial, end, exit } = animatedRouteValues[direction];
  const transition = animatedRouteTransitionConfig[direction];

  const { state } = useLocation();
  const navigationType = useNavigationType();
  const isBack =
    (navigationType === 'POP' && state?.isBack !== false) || state?.isBack;

  const { currentAddress } = useCurrentAddressStore();
  const { avatar } = useAvatar({ address: currentAddress });

  const leftNavbarIcon = useMemo(() => {
    if (navbarIcon === 'arrow') {
      return <Navbar.BackButton />;
    } else if (navbarIcon === 'ex') {
      return <Navbar.CloseButton />;
    } else return undefined;
  }, [navbarIcon]);

  useEffect(() => {
    const app = document.getElementById('app');
    setTimeout(() => {
      if (!getInputIsFocused()) {
        app?.focus();
      }
    }, 150);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const content = (
    <AccentColorProviderWrapper
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
            style={{ overflow: 'auto', maxHeight: POPUP_DIMENSIONS.height }}
            animate={end}
            exit={isBack ? initial : exit}
            transition={transition}
            background={background}
            className={animatedRouteStyles}
          >
            {navbar && (
              <Navbar
                title={title || ''}
                background={navbarBackground}
                leftComponent={leftNavbarIcon}
                rightComponent={rightNavbarComponent}
              />
            )}
            {children}
          </Box>
        </containerRefContext.Provider>
      </AvatarColorProvider>
    </AccentColorProviderWrapper>
  );

  if (protectedRoute) {
    return (
      <ProtectedRoute allowedStates={protectedRoute}>{content}</ProtectedRoute>
    );
  }
  return content;
});

AnimatedRoute.displayName = 'AnimatedRoute';
