import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { Box } from '~/design-system';
import { BackgroundColor } from '~/design-system/styles/designTokens';

interface BottomSheetProps {
  background?: BackgroundColor;
  children: ReactNode;
  show: boolean;
  zIndex?: number;
}

export const BottomSheet = ({
  background,
  show,
  children,
  zIndex,
}: BottomSheetProps) => {
  return (
    <AnimatePresence>
      {show && (
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          style={{
            width: '100%',
            height: '100%',
            zIndex: zIndex ?? 2000,
          }}
          background={background || 'scrimTertiary'}
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="background"
          transition={{ duration: 0.3 }}
        />
      )}
      {show && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          paddingBottom="20px"
          paddingHorizontal="12px"
          style={{ zIndex: zIndex ? zIndex + 1 : 2001 }}
          as={motion.div}
          initial={{ opacity: 1, y: 800 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 1, y: 800 }}
          key="bottom"
          transition={{ duration: 0.3 }}
        >
          <Box background="surfacePrimaryElevated" borderRadius="24px">
            {children}
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};
