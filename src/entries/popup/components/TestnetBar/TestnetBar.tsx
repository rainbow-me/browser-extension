import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router';

import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box, Inline, Text } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';
import { MenuItem } from '../Menu/MenuItem';

import { TestnetBarBackground } from './TestnetBarBackground';

export const TestnetBar = ({ testnetMode }: { testnetMode: boolean }) => {
  const location = useLocation();

  const showTestnetBar = testnetMode && location.pathname !== ROUTES.UNLOCK;

  return (
    <AnimatePresence initial={false}>
      {showTestnetBar && (
        <Box
          as={motion.div}
          key={'testnet-bar'}
          testId="testnet-bar"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: '35px' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            height: '35px',
            width: POPUP_DIMENSIONS.width,
            zIndex: zIndexes.SPEED_UP_CANCEL_PROMPT,
            backgroundColor: 'rgba(62, 207, 91, 0.06)',
          }}
        >
          <Box
            height="full"
            style={{
              borderColor: globalColors.green90,
            }}
            borderBottomWidth="1px"
          >
            <Inline
              height="full"
              space="4px"
              alignVertical="center"
              alignHorizontal="center"
            >
              <Box
                position="absolute"
                style={{
                  overflow: 'clip',
                }}
                marginRight="-12px"
              >
                <TestnetBarBackground />
              </Box>
              <MenuItem.TextIcon icon="🕹" />
              <Text align="center" color="green" size="12pt" weight="heavy">
                Testnet Mode
              </Text>
            </Inline>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};
