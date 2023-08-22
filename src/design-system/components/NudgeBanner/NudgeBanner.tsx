import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

import { Box } from '~/design-system';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

interface BottomSheetProps {
  children: ReactNode;
  show: boolean;
  zIndex?: number;
}

export const NudgeBanner = ({ show, children, zIndex }: BottomSheetProps) => {
  return (
    <AnimatePresence>
      {show && (
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          paddingBottom="16px"
          paddingHorizontal="16px"
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
          <Box
            opacity="1"
            background="surfaceMenu"
            borderRadius="20px"
            borderWidth="1px"
            borderColor="buttonStroke"
            backdropFilter="blur(26px)"
          >
            {children}
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};
