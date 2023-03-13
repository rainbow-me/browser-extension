import React, { useCallback, useEffect, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { AlertProps, useAlert } from '~/entries/popup/hooks/useAlert';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

export const Alert = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const { listenAlert, clearAlertListener } = useAlert();
  const alertCallback = useRef<() => void>();

  listenAlert(async ({ text, callback }: AlertProps) => {
    setText(text);
    setVisible(true);
    alertCallback.current = callback;
  });

  const onClose = useCallback(() => {
    setVisible(false);
    alertCallback.current?.();
  }, []);

  useEffect(() => {
    return () => clearAlertListener();
  }, [clearAlertListener]);

  if (!visible) return null;

  return (
    <Prompt zIndex={zIndexes.ALERT} show={visible}>
      <Box padding="20px">
        <Stack space="20px">
          <Box style={{ wordBreak: 'break-all' }}>
            <Text align="center" color="label" size="14pt" weight="medium">
              {text}
            </Text>
          </Box>
          <Inline alignHorizontal="right">
            <Button
              width="fit"
              color="accent"
              height="28px"
              variant="flat"
              onClick={onClose}
            >
              <Text color="label" size="16pt" weight="bold">
                {i18n.t('alert.ok')}
              </Text>
            </Button>
          </Inline>
        </Stack>
      </Box>
    </Prompt>
  );
};
