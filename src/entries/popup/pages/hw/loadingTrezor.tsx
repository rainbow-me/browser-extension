import React from 'react';

import { i18n } from '~/core/languages';
import { Box, Text } from '~/design-system';

import { FullScreenContainer } from '../../components/FullScreen/FullScreenContainer';
import { Spinner } from '../../components/Spinner/Spinner';

export function LoadingTrezor() {
  return (
    <FullScreenContainer>
      <Box alignItems="center">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('hw.waiting_for_trezor_connect')}
        </Text>
      </Box>

      <Box alignItems="center" width="full">
        <Box
          alignItems="center"
          justifyContent="center"
          width="full"
          paddingTop="80px"
        >
          <Text
            size="14pt"
            weight="regular"
            color="labelSecondary"
            align="center"
          >
            {i18n.t('hw.continue_on_trezor_connect')}
          </Text>
          <br />
          <br />
          <br />
          <Box
            width="fit"
            alignItems="center"
            justifyContent="center"
            style={{ margin: 'auto' }}
          >
            <Spinner size={32} />
          </Box>
        </Box>
      </Box>
    </FullScreenContainer>
  );
}
