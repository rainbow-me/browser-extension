import React, { useEffect } from 'react';

import ledgerDevice from 'static/assets/hw/ledger-device.png';
import { i18n } from '~/core/languages';
import { Box, Separator, Text } from '~/design-system';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import * as wallet from '../../handlers/wallet';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import { ROUTES } from '../../urls';

export function ConnectLedger() {
  const navigate = useRainbowNavigate();
  useEffect(() => {
    setTimeout(async () => {
      const res = await wallet.connectLedger();
      if (!res) alert('error connecting to ledger');
      if (res?.accountsToImport?.length) {
        navigate(ROUTES.HW_WALLET_LIST, {
          state: {
            ...res,
            vendor: 'Ledger',
          },
        });
      }
    }, 1500);
  }, [navigate]);

  return (
    <FullScreenContainer>
      <Box alignItems="center" paddingBottom="10px">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('hw.connect_ledger_title')}
        </Text>
        <Box padding="16px" paddingTop="10px">
          <Text
            size="12pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            {i18n.t('hw.connect_ledger_description')}
            <a
              href="https://learn.rainbow.me/"
              target="_blank"
              style={{ color: accentColorAsHsl }}
              rel="noreferrer"
            >
              {i18n.t('hw.learn_more')}
            </a>
            .
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
        <img src={ledgerDevice} width="130" />
      </Box>
    </FullScreenContainer>
  );
}
