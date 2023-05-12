import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { To } from 'react-router-dom';

import { useCurrentAddressStore } from '~/core/state';
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

import { AccentColorProviderWrapper } from '../Box/ColorContext';

import { animatedRouteStyles } from './AnimatedRoute.css';

type AnimatedRouteProps = {
  background?: BackgroundColor;
  backTo?: To;
  children: React.ReactNode;
  direction: AnimatedRouteDirection;
  navbar?: boolean;
  navbarIcon?: 'arrow' | 'ex';
  navbarBackground?: BackgroundColor;
  title?: string;
  protectedRoute?: UserStatusResult[] | true;
  rightNavbarComponent?: React.ReactElement;
  accentColor?: boolean;
  maintainLocationState?: boolean;
};

export const animatedRouteValues: Record<
  AnimatedRouteDirection,
  AnimatedRouteConfig
> = {
  base: {
    initial: {
      opacity: 0,
      y: -20,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -20,
    },
  },
  right: {
    initial: {
      opacity: 0,
      x: 20,
    },
    end: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -12,
    },
  },
  left: {
    initial: {
      opacity: 0,
      x: -20,
    },
    end: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 12,
    },
  },
  up: {
    initial: {
      opacity: 0,
      y: 20,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 12,
    },
  },
  down: {
    initial: {
      opacity: 0,
      y: -20,
    },
    end: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: -12,
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

export const AnimatedRoute = React.forwardRef<
  HTMLDivElement,
  AnimatedRouteProps
>((props: AnimatedRouteProps, ref) => {
  const {
    background,
    backTo,
    children,
    direction,
    navbar,
    navbarIcon,
    title,
    navbarBackground,
    protectedRoute,
    rightNavbarComponent,
    accentColor = true,
    maintainLocationState,
  } = props;
  const { initial, end, exit } = animatedRouteValues[direction];
  const transition = animatedRouteTransitionConfig[direction];

  const { currentAddress } = useCurrentAddressStore();
  const { avatar } = useAvatar({ address: currentAddress });

  const leftNavbarIcon = useMemo(() => {
    if (navbarIcon === 'arrow') {
      return (
        <Navbar.BackButton
          maintainLocationState={maintainLocationState}
          backTo={backTo}
        />
      );
    } else if (navbarIcon === 'ex') {
      return (
        <Navbar.CloseButton
          maintainLocationState={maintainLocationState}
          backTo={backTo}
        />
      );
    } else return undefined;
  }, [backTo, maintainLocationState, navbarIcon]);

  const content = (
    <AccentColorProviderWrapper
      color={accentColor ? avatar?.color : globalColors.blue60}
    >
      <Box
        as={motion.div}
        ref={ref}
        display="flex"
        flexDirection="column"
        height="full"
        initial={initial}
        animate={end}
        exit={exit}
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
