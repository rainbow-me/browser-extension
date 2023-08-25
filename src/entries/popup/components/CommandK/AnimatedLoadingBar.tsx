import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { Box } from '~/design-system';

import { MODAL_WIDTH } from './CommandKModal';
import { timingConfig } from './references';

const LOADER_WIDTH = 328;

const AnimatedLoadingBar = ({ isFetching }: { isFetching: boolean }) => {
  const controls = useAnimation();
  const { currentTheme } = useCurrentThemeStore();

  useEffect(() => {
    if (isFetching) {
      controls.start({
        opacity: [0, 0.8, 0],
        transition: {
          duration: 0.75,
          ease: [0.37, 0, 0.63, 1],
          repeat: Infinity,
          repeatType: 'mirror',
        },
        x: [-LOADER_WIDTH, MODAL_WIDTH],
      });
    }
  }, [controls, isFetching]);

  return (
    <AnimatePresence onExitComplete={() => controls.stop()}>
      {isFetching && (
        <Box
          animate={{ opacity: 1 }}
          as={motion.div}
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="commandKLoadingBarWrapper"
          position="absolute"
          style={{
            height: 1,
            left: 0,
            top: 0,
            width: LOADER_WIDTH,
            willChange: 'transform',
          }}
          transition={timingConfig(0.15)}
        >
          <Box
            animate={controls}
            as={motion.div}
            key="commandKLoadingBar"
            style={{
              background: `linear-gradient(90deg, transparent, ${
                currentTheme === 'dark' ? '#F5F8FF' : 'rgba(9, 17, 31, 0.4)'
              }, transparent)`,
              height: '100%',
              width: '100%',
              willChange: 'transform',
            }}
          />
        </Box>
      )}
    </AnimatePresence>
  );
};

export default AnimatedLoadingBar;
