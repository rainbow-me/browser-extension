import React, { useCallback } from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Text } from '~/design-system';

export function SuccessTrezor() {
  const onClose = useCallback(() => {
    window.close();
  }, []);

  return (
    <Box padding="24px">
      <Box alignItems="center">
        <Text size="16pt" weight="bold" color="label" align="center">
          {i18n.t('hw.trezor_success')}
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
            {i18n.t('hw.you_can_close_this_window')}
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
            <Button
              width="full"
              color="accent"
              height="28px"
              variant="flat"
              onClick={onClose}
              tabIndex={0}
            >
              <Text color="label" size="16pt" weight="bold">
                {i18n.t('alert.ok')}
              </Text>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
