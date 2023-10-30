import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router';

import { i18n } from '~/core/languages';
import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { POPUP_DIMENSIONS } from '~/core/utils/dimensions';
import { Box, Inline, Text } from '~/design-system';
import { globalColors } from '~/design-system/styles/designTokens';

import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';
import { MenuItem } from '../Menu/MenuItem';

import { TestnetBarBackground } from './TestnetBarBackground';

export const TestnetBar = ({ testnetMode }: { testnetMode: boolean }) => {
  const location = useLocation();
  const { currentTheme } = useCurrentThemeStore();

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
              borderColor:
                currentTheme === 'dark'
                  ? globalColors.green80
                  : globalColors.green50,
            }}
            borderBottomWidth="1.5px"
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
                  marginBottom: 2,
                }}
                marginRight="-12px"
              >
                <TestnetBarBackground currentTheme={currentTheme} />
              </Box>
              <MenuItem.TextIcon icon="🕹" />
              <Text align="center" color="green" size="12pt" weight="heavy">
                {i18n.t('menu.home_header_right.testnet_mode')}
              </Text>
            </Inline>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
};
