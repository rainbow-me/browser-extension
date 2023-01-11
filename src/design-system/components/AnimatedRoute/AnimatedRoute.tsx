import { motion } from 'framer-motion';
import React, { useContext } from 'react';

import { Box } from '~/design-system';
import {
  AnimatedRouteConfig,
  AnimatedRouteDirection,
  BackgroundColor,
  animatedRouteTransitionConfig,
} from '~/design-system/styles/designTokens';
import { ProtectedRoute } from '~/entries/popup/ProtectedRoute';
import { RouterContext } from '~/entries/popup/Routes';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { UserStatusResult } from '~/entries/popup/hooks/useAuth';

import { animatedRouteStyles } from './AnimatedRoute.css';

type AnimatedRouteProps = {
  background?: BackgroundColor;
  children: React.ReactNode;
  direction: AnimatedRouteDirection;
  navbar?: boolean;
  navbarBackground?: BackgroundColor;
  title?: string;
  protectedRoute?: UserStatusResult[] | true;
  rightNavbarComponent?: React.ReactElement;
};

export const animatedRouteValues: Record<
  AnimatedRouteDirection,
  AnimatedRouteConfig
> = {
  base: {
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
      y: -16,
    },
  },
  horizontal: {
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
      x: 16,
    },
  },
  vertical: {
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

export const AnimatedRoute = React.forwardRef<
  HTMLDivElement,
  AnimatedRouteProps
>((props: AnimatedRouteProps, ref) => {
  const RouteInfo = useContext(RouterContext);
  console.log('RouteInfo: ', RouteInfo);
  const previousRouteDirection = RouteInfo?.from;
  const {
    background,
    children,
    direction,
    navbar,
    title,
    navbarBackground,
    protectedRoute,
    rightNavbarComponent,
  } = props;
  const { initial, end, exit } = animatedRouteValues[previousRouteDirection];
  console.log('animated route config: ', { initial, end, exit });
  const transition = animatedRouteTransitionConfig[previousRouteDirection];
  console.log('animated route transition: ', transition);

  const content = (
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
          leftComponent={
            direction === 'horizontal' ? (
              <Navbar.BackButton />
            ) : (
              <Navbar.CloseButton />
            )
          }
          rightComponent={rightNavbarComponent}
        />
      )}
      {children}
    </Box>
  );

  if (protectedRoute) {
    return (
      <ProtectedRoute allowedStates={protectedRoute}>{content}</ProtectedRoute>
    );
  }
  return content;
});

AnimatedRoute.displayName = 'AnimatedRoute';
