import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode } from 'react';

import { Box } from '~/design-system';

export const BottomSheet = ({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) => {
  return (
    <AnimatePresence>
      <>
        {show && (
          <>
            <Box
              position="fixed"
              bottom="0"
              left="0"
              right="0"
              style={{
                width: '100%',
                height: '100%',
                zIndex: 10,
              }}
              background="scrimTertiary"
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <Box
              position="absolute"
              bottom="0"
              left="0"
              right="0"
              paddingBottom="20px"
              paddingHorizontal="12px"
              opacity="1"
              style={{ zIndex: 111 }}
              as={motion.div}
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
            >
              <Box
                background="surfacePrimaryElevatedSecondary"
                borderRadius="24px"
              >
                {children}
              </Box>
            </Box>
          </>
        )}
      </>
    </AnimatePresence>
  );
};
