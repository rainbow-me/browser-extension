import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box, Row, Rows } from '~/design-system';
import {
  BackdropFilter,
  BackgroundColor,
  Space,
  animatedRouteTransitionConfig,
} from '~/design-system/styles/designTokens';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { BoxProps } from '../Box/Box';

export const Prompt = ({
  show,
  children,
  padding = '40px',
  background,
  scrimBackground,
  backdropFilter,
  zIndex,
  handleClose,
  borderRadius = '16px',
}: {
  show: boolean;
  children: ReactNode;
  padding?: Space;
  background?: BackgroundColor;
  scrimBackground?: boolean;
  backdropFilter?: BackdropFilter;
  zIndex?: number;
  handleClose?: () => void;
  borderRadius?: BoxProps['borderRadius'];
}) => {
  const emphasizedShort = animatedRouteTransitionConfig['emphasizedShort'];
  const deceleratedShort = animatedRouteTransitionConfig['deceleratedShort'];
  const maxWidth =
    POPUP_DIMENSIONS.width - Number(padding?.replace('px', '')) * 2;

  return (
    <AnimatePresence>
      {show && scrimBackground && (
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: zIndex || zIndexes.PROMPT,
          }}
          background="scrim"
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="background"
        />
      )}
      {show && (
        <Box
          isModal
          key="content"
          position="fixed"
          top="0"
          bottom="0"
          left="0"
          right="0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: zIndex || zIndexes.PROMPT + 1,
          }}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={emphasizedShort}
          backdropFilter={backdropFilter ?? 'blur(12px)'}
          background="scrim"
          padding={padding}
          onClick={() => handleClose?.()}
        >
          <Rows alignVertical="center">
            <Row height="content">
              <Box
                style={{
                  maxWidth,
                  margin: 'auto',
                }}
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  as={motion.div}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={deceleratedShort}
                  background={background ?? 'surfaceMenu'}
                  borderRadius={borderRadius}
                  borderColor="separatorTertiary"
                  borderWidth="1px"
                  style={{ overflow: 'hidden' }}
                >
                  {children}
                </Box>
              </Box>
            </Row>
          </Rows>
        </Box>
      )}
    </AnimatePresence>
  );
};
