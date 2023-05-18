import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { Box } from '~/design-system';
import { BackgroundColor } from '~/design-system/styles/designTokens';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

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
    <Box as={motion.div} key="bottom-sheet" layout isModal={show}>
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
              zIndex: zIndex ?? zIndexes.BOTTOM_SHEET,
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
            paddingBottom="12px"
            paddingHorizontal="12px"
            style={{
              zIndex: zIndex ? zIndex + 1 : zIndexes.BOTTOM_SHEET + 1,
            }}
            as={motion.div}
            initial={{ opacity: 1, y: 800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 800 }}
            key="bottom"
            transition={{ duration: 0.3 }}
            layout
          >
            <Box background="surfacePrimaryElevated" borderRadius="24px">
              {children}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};
