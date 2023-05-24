import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import ledgerDeviceEth from 'static/assets/hw/ledger-device-eth.png';
import ledgerDeviceUnlock from 'static/assets/hw/ledger-device-unlock.png';
import ledgerDevice from 'static/assets/hw/ledger-device.png';
import { i18n } from '~/core/languages';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Separator, Stack, Text } from '~/design-system';
import { TextLink } from '~/design-system/components/TextLink/TextLink';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

const ConnectingToLedger = () => {
  return (
    <>
      <Box style={{ zIndex: 2 }}>
        <Stack space="24px" alignHorizontal="center">
          <Box alignItems="center" paddingHorizontal="28px">
            <Stack space="12px">
              <Text size="16pt" weight="bold" color="label" align="center">
                {i18n.t('hw.connect_ledger_title')}
              </Text>
              <Box>
                <Text
                  size="12pt"
                  weight="regular"
                  color="labelTertiary"
                  align="center"
                >
                  {i18n.t('hw.connect_ledger_description')}
                  <TextLink
                    color="blue"
                    onClick={() =>
                      goToNewTab({ url: 'https://learn.rainbow.me/' })
                    }
                  >
                    {i18n.t('hw.learn_more')}
                  </TextLink>
                  .
                </Text>
              </Box>
            </Stack>
          </Box>
          <Box alignItems="center" width="full" style={{ width: '106px' }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>
        </Stack>
      </Box>

      <Box
        alignItems="center"
        justifyContent="center"
        display="flex"
        marginTop="-4px"
        style={{ zIndex: 1, paddingRight: '16px' }}
      >
        <img src={ledgerDevice} width="130" />
      </Box>
    </>
  );
};

const LedgerNeedsUnlock = () => {
  return (
    <>
      <Box style={{ zIndex: 2 }}>
        <Stack space="24px" alignHorizontal="center">
          <Box alignItems="center" paddingHorizontal="28px">
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
      </Box>

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

      <Box paddingTop="10px">
        <Text size="12pt" weight="regular" color="labelTertiary" align="center">
          {i18n.t('hw.unlock_ledger_description_2')}
        </Text>
      </Box>
    </>
  );
};

const LedgerNeedsAppOpened = () => {
  return (
    <>
      <Box style={{ zIndex: 2 }}>
        <Stack space="24px" alignHorizontal="center">
          <Box alignItems="center" paddingHorizontal="28px">
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
      </Box>
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

      <Box>
        <Text size="12pt" weight="regular" color="labelTertiary" align="center">
          {i18n.t('hw.needs_app_ledger_description_2')}
        </Text>
      </Box>
    </>
  );
};

export function ConnectLedger() {
  const navigate = useRainbowNavigate();
  const { state } = useLocation();

  useEffect(() => {
    setTimeout(async () => {
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
      }
    }, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FullScreenContainer>
      <ConnectingToLedger />
      <LedgerNeedsUnlock />
      <LedgerNeedsAppOpened />
    </FullScreenContainer>
  );
}
