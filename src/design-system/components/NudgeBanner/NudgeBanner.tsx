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
          as={motion.div}
          bottom="16px"
          key="nudgeBannerContainer"
          opacity="1"
          borderRadius="20px"
          borderWidth="1px"
          borderColor={currentTheme === 'dark' ? 'buttonStroke' : 'transparent'}
          boxShadow="24px"
          initial={false}
          animate={{
            scale: 1,
            opacity: 1,
            y: featureFlags.new_tab_bar_enabled ? -64 : 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: featureFlags.new_tab_bar_enabled ? -64 : 0,
          }}
          flexGrow="1"
          transition={{
            type: 'spring',
            stiffness: 750,
            damping: 40,
            mass: 1.2,
          }}
          position="absolute"
          style={{
            alignSelf: 'center',
            backdropFilter: 'blur(26px)',
            backgroundColor:
              currentTheme === 'dark'
                ? 'rgba(53, 54, 58, 0.8)'
                : 'rgba(255, 255, 255, 0.8)',
            left: 16,
            right: 16,
            willChange: 'transform',
            zIndex: zIndex ? zIndex + 1 : zIndexes.BOTTOM_SHEET + 1,
          }}
        >
          {children}
        </Box>
      )}
    </AnimatePresence>
  );
};
