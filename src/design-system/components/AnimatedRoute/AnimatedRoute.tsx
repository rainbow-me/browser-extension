import { motion } from 'framer-motion';
import React from 'react';

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

type AnimatedRouteProps = {
  background?: BackgroundColor;
  children: React.ReactNode;
  direction: AnimatedRouteDirection;
  navbar?: boolean;
  navbarBackground?: BackgroundColor;
  title?: string;
  protectedRoute?: UserStatusResult[] | true;
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
  const {
    background,
    children,
    direction,
    navbar,
    title,
    navbarBackground,
    protectedRoute,
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
