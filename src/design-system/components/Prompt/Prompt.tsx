import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { Box, Row, Rows } from '~/design-system';
import { animatedRouteTransitionConfig } from '~/design-system/styles/designTokens';

export const Prompt = ({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) => {
  const transition = animatedRouteTransitionConfig['vertical'];

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
          transition={transition}
          backdropFilter="blur(26px)"
          padding="40px"
        >
          <Rows alignVertical="center">
            <Row height="content">
              <Box
                as={motion.div}
                initial={{ y: 16 }}
                exit={{ y: 16 }}
                animate={{ y: 0 }}
                transition={transition}
                padding="12px"
                background="surfaceMenu"
                borderRadius="12px"
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
