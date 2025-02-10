import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import ledgerDeviceEth from 'static/assets/hw/ledger-device-eth.png';
import ledgerDeviceUnlock from 'static/assets/hw/ledger-device-unlock.png';
import ledgerDevice from 'static/assets/hw/ledger-device.png';
import { analytics } from '~/analytics';
import { i18n } from '~/core/languages';
import { KeychainType } from '~/core/types/keychainTypes';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Separator, Stack, Text } from '~/design-system';
import { TextLink } from '~/design-system/components/TextLink/TextLink';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const ConnectingToLedger = () => {
  return (
    <Box>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center" paddingHorizontal="28px">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('hw.connect_ledger_title')}
            </Text>
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.connect_ledger_description')}{' '}
              <TextLink
                color="blue"
                onClick={() =>
                  goToNewTab({
                    url: 'https://rainbow.me/support/extension/connect-your-hardware-wallet',
                  })
                }
              >
                {i18n.t('hw.learn_more')}
              </TextLink>
            </Text>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      </Stack>

      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        marginTop="-4px"
        style={{ zIndex: 1, paddingRight: '16px' }}
      >
        <img src={ledgerDevice} width="130" />
      </Box>
    </Box>
  );
};

const LedgerNeedsUnlock = () => {
  return (
    <Box>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center" paddingHorizontal="48px">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('hw.unlock_ledger_title')}
            </Text>
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.unlock_ledger_description')}
            </Text>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      </Stack>

      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        style={{ zIndex: 1 }}
        paddingTop="8px"
        paddingLeft="19px"
        marginBottom="-52px"
      >
        <img src={ledgerDeviceUnlock} width="340" />
      </Box>

      <Box paddingTop="10px" paddingHorizontal="20px">
        <Text size="12pt" weight="regular" color="labelTertiary" align="center">
          {i18n.t('hw.unlock_ledger_description_2')}
        </Text>
      </Box>
    </Box>
  );
};
const LedgerNeedsExclusivity = () => {
  return (
    <Box>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center" paddingHorizontal="48px">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('hw.exclusivity_ledger_title')}
            </Text>
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.exclusivity_ledger_description')}
            </Text>
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.exclusivity_ledger_description_2')}
            </Text>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      </Stack>

      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        style={{ zIndex: 1 }}
        paddingTop="8px"
        paddingLeft="19px"
        marginBottom="-52px"
      >
        <img src={ledgerDevice} width="130" />
      </Box>
    </Box>
  );
};

const LedgerNeedsAppOpened = () => {
  return (
    <Box>
      <Stack space="24px" alignHorizontal="center">
        <Box alignItems="center" paddingHorizontal="48px">
          <Stack space="12px">
            <Text size="16pt" weight="bold" color="label" align="center">
              {i18n.t('hw.needs_app_ledger_title')}
            </Text>
            <Text
              size="12pt"
              weight="regular"
              color="labelTertiary"
              align="center"
            >
              {i18n.t('hw.needs_app_ledger_description')}
            </Text>
          </Stack>
        </Box>
        <Box alignItems="center" width="full" style={{ width: '106px' }}>
          <Separator color="separatorTertiary" strokeWeight="1px" />
        </Box>
      </Stack>

      <Box style={{ width: '360px' }} marginBottom="-40px">
        <Box
          style={{
            zIndex: 1,
            overflow: 'hidden',
          }}
          paddingHorizontal="19px"
          paddingTop="10px"
        >
          <img src={ledgerDeviceEth} width="566px" />
        </Box>
      </Box>

      <Box paddingHorizontal="20px">
        <Text size="12pt" weight="regular" color="labelTertiary" align="center">
          {i18n.t('hw.needs_app_ledger_description_2')}
        </Text>
      </Box>
    </Box>
  );
};

export function ConnectLedger() {
  const [connectingState, setConnectingState] = useState<
    'needs_connect' | 'needs_unlock' | 'needs_app' | 'needs_exclusivity'
  >('needs_connect');

  const navigate = useRainbowNavigate();
  const { state } = useLocation();
  const timer = useRef<NodeJS.Timeout>();

  const connectLedger = useCallback(async () => {
    const res = await wallet.connectLedger();
    if (res?.accountsToImport?.length) {
      navigate(ROUTES.HW_WALLET_LIST, {
        state: {
          ...res,
          vendor: 'Ledger',
          direction: state?.direction,
          navbarIcon: state?.navbarIcon,
        },
      });
      analytics.track('wallet.added', {
        type: KeychainType.HardwareWalletKeychain,
        vendor: 'Ledger',
      });
    } else if (res.error) {
      setConnectingState(
        res.error as
          | 'needs_connect'
          | 'needs_unlock'
          | 'needs_app'
          | 'needs_exclusivity',
      );
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        connectLedger();
      }, 5000);
    }
  }, [navigate, state?.direction, state?.navbarIcon]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      connectLedger();
    }, 1500);
    return () => clearTimeout(timeout);
  }, [connectLedger]);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  return (
    <FullScreenContainer>
      <AnimatePresence initial={false}>
        {connectingState === 'needs_app' && (
          <Box as={motion.div} key="needs-app">
            <LedgerNeedsAppOpened />
          </Box>
        )}
        {connectingState === 'needs_unlock' && (
          <Box as={motion.div} key="needs-unlock">
            <LedgerNeedsUnlock />
          </Box>
        )}
        {connectingState === 'needs_connect' && (
          <Box as={motion.div} key="needs-connect">
            <ConnectingToLedger />
          </Box>
        )}
        {connectingState === 'needs_exclusivity' && (
          <Box as={motion.div} key="needs-exclusivity">
            <LedgerNeedsExclusivity />
          </Box>
        )}
      </AnimatePresence>
    </FullScreenContainer>
  );
}
