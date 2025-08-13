import React, { useEffect } from 'react';

import trezorDevice from 'static/assets/hw/trezor-device.png';
import { analytics } from '~/analytics';
import { i18n } from '~/core/languages';
import { KeychainType } from '~/core/types/keychainTypes';
import { goToNewTab } from '~/core/utils/tabs';
import { Box, Separator, Text } from '~/design-system';
import { TextLink } from '~/design-system/components/TextLink/TextLink';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ConnectTrezor() {
  const navigate = useRainbowNavigate();
  useEffect(() => {
    setTimeout(async () => {
      const res = await wallet.connectTrezor();
      if ('error' in res) return alert('error connecting to trezor');
      if (res.accountsToImport.length) {
        navigate(ROUTES.HW_WALLET_LIST, {
          state: {
            ...res,
            vendor: 'Trezor',
          },
        });
        analytics.track('wallet.added', {
          type: KeychainType.HardwareWalletKeychain,
          vendor: 'Trezor',
        });
      }
    }, 1500);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('hw.connect_trezor_title')}
        </Text>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('hw.connect_trezor_description')}{' '}
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
        </Box>
      </Box>
      <Box width="full" style={{ width: '106px' }}>
        <Separator color="separatorTertiary" strokeWeight="1px" />
      </Box>
      <Box
        paddingTop="28px"
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        <img src={trezorDevice} width="160" />
      </Box>
    </FullScreenContainer>
  );
}
