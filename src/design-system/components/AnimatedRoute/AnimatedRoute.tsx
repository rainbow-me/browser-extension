import { motion } from 'framer-motion';
import React from 'react';
import { To } from 'react-router-dom';

import { Box } from '~/design-system';
import {
  AnimatedRouteConfig,
  AnimatedRouteDirection,
  BackgroundColor,
  animatedRouteTransitionConfig,
} from '~/design-system/styles/designTokens';
import { ProtectedRoute } from '~/entries/popup/ProtectedRoute';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';
import { UserStatusResult } from '~/entries/popup/hooks/useAuth';

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
      x: -12,
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
  } = props;
  const { initial, end, exit } = animatedRouteValues[direction];
  const transition = animatedRouteTransitionConfig[direction];

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
            navbarIcon === 'arrow' ? (
              <Navbar.BackButton backTo={backTo} />
            ) : (
              <Navbar.CloseButton backTo={backTo} />
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
