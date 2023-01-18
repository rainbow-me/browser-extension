import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { Box, Row, Rows } from '~/design-system';
import {
  BackgroundColor,
  Space,
  animatedRouteTransitionConfig,
} from '~/design-system/styles/designTokens';

export const Prompt = ({
  show,
  children,
  padding,
  background,
}: {
  show: boolean;
  children: ReactNode;
  padding?: Space;
  background?: BackgroundColor;
}) => {
  const emphasizedShort = animatedRouteTransitionConfig['emphasizedShort'];
  const deceleratedShort = animatedRouteTransitionConfig['deceleratedShort'];

  return (
    <AnimatePresence>
      {show && (
        <Box
          position="fixed"
          top="0"
          bottom="0"
          left="0"
          right="0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: 10,
          }}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={emphasizedShort}
          backdropFilter="blur(26px)"
          padding={padding ?? '40px'}
        >
          <Rows alignVertical="center">
            <Row height="content">
              <Box
                as={motion.div}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={deceleratedShort}
                padding="12px"
                background={background ?? 'surfaceMenu'}
                borderRadius="16px"
                borderColor="separatorTertiary"
                borderWidth="1px"
              >
                {children}
              </Box>
            </Row>
          </Rows>
        </Box>
      )}
    </AnimatePresence>
  );
};
