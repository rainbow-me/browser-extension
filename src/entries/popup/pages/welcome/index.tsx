import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useState } from 'react';

import { i18n } from '~/core/languages';
import { usePendingRequestStore } from '~/core/state';
import { useInviteCodeStore } from '~/core/state/inviteCode';
import { Box, Stack, Text } from '~/design-system';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';
import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';
import usePrevious from '../../hooks/usePrevious';

import { ImportOrCreateWallet } from './ImportOrCreateWallet';
import { InviteCodePortal } from './InviteCodePortal';
import { OnboardBeforeConnectSheet } from './OnboardBeforeConnectSheet';

export function Welcome() {
  const { pendingRequests } = usePendingRequestStore();
  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(!!pendingRequests.length);
  const headerControls = useAnimationControls();

  const { inviteCodeValidated } = useInviteCodeStore();
  const [screen, setScreen] = useState<'invite_code' | 'unlock'>(
    inviteCodeValidated ? 'unlock' : 'invite_code',
  );
  const prevScreen = usePrevious(screen);

  React.useEffect(() => {
    if (prevScreen === 'invite_code' && screen === 'unlock') {
      headerControls.start({
        marginTop: 135,
      });
    }
  }, [headerControls, prevScreen, screen]);

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <FlyingRainbows screen={screen}>
        <Box
          as={motion.div}
          initial={{ marginTop: screen === 'unlock' ? 135 : 186 }}
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
        <AnimatePresence mode="popLayout">
          {screen === 'invite_code' ? (
            <Box width="full">
              <InviteCodePortal
                onInviteCodeValidated={() => setScreen('unlock')}
              />
            </Box>
          ) : null}
          {screen === 'unlock' ? (
            <Box width="full">
              <ImportOrCreateWallet />
            </Box>
          ) : null}
        </AnimatePresence>
      </FlyingRainbows>
    </>
  );
}
