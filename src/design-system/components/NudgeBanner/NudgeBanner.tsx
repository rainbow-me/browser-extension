import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box } from '~/design-system';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

interface NudgeBannerProps {
  children: ReactNode;
  show: boolean;
  zIndex?: number;
}

export const NudgeBanner = ({ show, children, zIndex }: NudgeBannerProps) => {
  const { currentTheme } = useCurrentThemeStore();
  const { featureFlags } = useFeatureFlagsStore();

  return (
    <AnimatePresence initial={false}>
      {show && (
        <Box
          animate={{
            opacity: 1,
            scale: 1,
            y: featureFlags.new_tab_bar_enabled ? -64 : 0,
          }}
          as={motion.div}
          background="surfaceMenu"
          borderColor={currentTheme === 'dark' ? 'buttonStroke' : 'transparent'}
          borderRadius="20px"
          borderWidth="1px"
          bottom="16px"
          boxShadow="24px"
          exit={{
            opacity: 0,
            scale: 0.9,
            y: featureFlags.new_tab_bar_enabled ? -64 : 0,
          }}
          flexGrow="1"
          initial={false}
          key="nudgeBannerContainer"
          opacity="1"
          position="absolute"
          style={{
            alignSelf: 'center',
            backdropFilter: 'blur(26px)',
            left: 16,
            right: 16,
            willChange: 'transform',
            zIndex: zIndex ? zIndex + 1 : zIndexes.BOTTOM_SHEET + 1,
          }}
          transition={{
            damping: 40,
            mass: 1.2,
            stiffness: 750,
            type: 'spring',
          }}
        >
          {children}
        </Box>
      )}
    </AnimatePresence>
  );
};
