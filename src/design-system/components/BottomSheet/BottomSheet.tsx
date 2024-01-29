import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useEffect, useRef } from 'react';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box } from '~/design-system';
import { BackgroundColor } from '~/design-system/styles/designTokens';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

interface BottomSheetProps {
  background?: BackgroundColor;
  children: ReactNode;
  show: boolean;
  zIndex?: number;
  onClickOutside?: VoidFunction;
}

export const BottomSheet = ({
  background,
  children,
  show,
  zIndex,
  onClickOutside,
}: BottomSheetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // capture focus on mount so that keyboard events are handled
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <>
          <Box
            position="fixed"
            onClick={onClickOutside}
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
            ref={containerRef}
            tabIndex={0}
          />
          <Box
            position="absolute"
            bottom="0"
            left="0"
            right="0"
            paddingBottom="12px"
            paddingHorizontal="12px"
            style={{ zIndex: zIndex ? zIndex + 1 : zIndexes.BOTTOM_SHEET + 1 }}
            as={motion.div}
            initial={{ opacity: 1, y: 800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 1, y: 800 }}
            key="bottom"
            transition={{ duration: 0.3 }}
            layout
            isModal
          >
            <Box
              background="surfacePrimaryElevated"
              borderRadius="24px"
              style={{
                maxHeight: POPUP_DIMENSIONS.height - 24, // 24 from paddings
                overflow: 'scroll',
              }}
              borderWidth="1.5px"
              borderColor="separatorSecondary"
            >
              {children}
            </Box>
          </Box>
        </>
      )}
    </AnimatePresence>
  );
};
