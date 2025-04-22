import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { usePendingRequestStore } from '~/core/state';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { Box, Stack, Text } from '~/design-system';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';
import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';

import { ImportOrCreateWallet } from './ImportOrCreateWallet';
import { OnboardBeforeConnectSheet } from './OnboardBeforeConnectSheet';

export function Welcome() {
  const { pendingRequests } = usePendingRequestStore();
  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(!!pendingRequests.length);
  const headerControls = useAnimationControls();
  const setNeedsInitialization = useWalletBackupsStore(
    (state) => state.setNeedsInitialization,
  );

  useEffect(() => {
    setNeedsInitialization(false);
  }, [setNeedsInitialization]);

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <FlyingRainbows>
        <Box
          as={motion.div}
          initial={{ marginTop: 135 }}
          animate={headerControls}
        >
          <Stack space="4px">
            <Box width="full" display="flex" justifyContent="center">
              <LogoWithLetters color="label" />
            </Box>
            <Box
              width="full"
              justifyContent="center"
              alignItems="center"
              display="flex"
            >
              <Text
                align="center"
                color="labelTertiary"
                size="16pt"
                weight="bold"
              >
                {i18n.t('welcome.subtitle')}
              </Text>
            </Box>
          </Stack>
        </Box>
        <AnimatePresence mode="popLayout" initial={false}>
          <Box key="welcome" width="full">
            <ImportOrCreateWallet />
          </Box>
        </AnimatePresence>
      </FlyingRainbows>
    </>
  );
}
