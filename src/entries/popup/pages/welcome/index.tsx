import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useRemoteConfig } from '~/core/firebase/useRemoteConfig';
import { i18n } from '~/core/languages';
import { useInviteCodeStore, usePendingRequestStore } from '~/core/state';
import { useWalletBackupsStore } from '~/core/state/walletBackups';
import { Box, Stack, Text } from '~/design-system';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';
import { LogoWithLetters } from '../../components/LogoWithLetters/LogoWithLetters';
import usePrevious from '../../hooks/usePrevious';

import { ImportOrCreateWallet } from './ImportOrCreateWallet';
import { InviteCodePortal } from './InviteCodePortal';
import { OnboardBeforeConnectSheet } from './OnboardBeforeConnectSheet';

const BYPASS_INVITE_CODE =
  process.env.IS_TESTING === 'true' || process.env.IS_DEV === 'true';

export function Welcome() {
  const { pendingRequests } = usePendingRequestStore();
  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(!!pendingRequests.length);
  const headerControls = useAnimationControls();
  const { remoteConfig } = useRemoteConfig();
  const { setNeedsInitialization } = useWalletBackupsStore();

  const { inviteCodeValidated, setInviteCodeValidated } = useInviteCodeStore();
  const [screen, setScreen] = useState<'invite_code' | 'welcome' | ''>(
    BYPASS_INVITE_CODE || inviteCodeValidated ? 'welcome' : '',
  );
  const prevScreen = usePrevious(screen);

  useEffect(() => {
    if (Object.keys(remoteConfig).length && !BYPASS_INVITE_CODE) {
      setScreen(
        remoteConfig.invite_code_required && !inviteCodeValidated
          ? 'invite_code'
          : 'welcome',
      );
    }
  }, [inviteCodeValidated, remoteConfig.invite_code_required, remoteConfig]);

  useEffect(() => {
    if (prevScreen === 'invite_code' && screen === 'welcome') {
      headerControls.start({
        marginTop: 135,
      });
    }
  }, [headerControls, prevScreen, screen]);

  useEffect(() => {
    setNeedsInitialization(false);
  }, [setNeedsInitialization]);

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <FlyingRainbows screen={screen}>
        <Box
          as={motion.div}
          initial={{ marginTop: screen === 'welcome' ? 135 : 186 }}
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
          {screen === 'invite_code' ? (
            <Box
              as={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              key="invite-code"
              width="full"
            >
              <InviteCodePortal
                onInviteCodeValidated={(valid: boolean) => {
                  setInviteCodeValidated(valid);
                  if (valid) {
                    setScreen('welcome');
                  }
                }}
              />
            </Box>
          ) : null}
          {screen === 'welcome' ? (
            <Box key="welcome" width="full">
              <ImportOrCreateWallet />
            </Box>
          ) : null}
        </AnimatePresence>
      </FlyingRainbows>
    </>
  );
}
