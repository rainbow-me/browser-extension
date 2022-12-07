import { motion } from 'framer-motion';
import React from 'react';

import { Box } from '~/design-system';
import {
  AnimatedRouteConfig,
  AnimatedRouteDirection,
  animatedRouteTransitionConfig,
} from '~/design-system/styles/designTokens';
import { Navbar } from '~/entries/popup/components/Navbar/Navbar';

type AnimatedRouteProps = {
  children: React.ReactNode;
  direction: AnimatedRouteDirection;
  navbar?: boolean;
  title?: string;
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
};

export const AnimatedRoute = React.forwardRef<
  HTMLDivElement,
  AnimatedRouteProps
>((props: AnimatedRouteProps, ref) => {
  const { children, direction, navbar, title } = props;
  const { initial, end, exit } = animatedRouteValues[direction];
  const transition = animatedRouteTransitionConfig[direction];
  return (
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
    >
      {navbar && (
        <Navbar
          title={title || ''}
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
});

AnimatedRoute.displayName = 'AnimatedRoute';
