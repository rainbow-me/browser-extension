import React from 'react';

import trezorDevice from 'static/assets/hw/trezor-device.png';
import { i18n } from '~/core/languages';
import { Box, Separator, Text } from '~/design-system';
import { accentColorAsHsl } from '~/design-system/styles/core.css';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';

export function LoadingTrezor() {
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
            {i18n.t('hw.connect_trezor_description')}
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
        <img src={trezorDevice} width="160" />
      </Box>
    </FullScreenContainer>
  );
}
