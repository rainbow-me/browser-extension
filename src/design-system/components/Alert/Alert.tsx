import React, { useCallback, useRef, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import { AlertProps, listenAlert } from './util';

export const Alert = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState('');
  const alertCallback = useRef<() => void>();
  const { trackShortcut } = useKeyboardAnalytics();

  listenAlert(async ({ text, callback }: AlertProps) => {
    setText(text);
    setVisible(true);
    alertCallback.current = callback;
  });

  const onClose = useCallback(() => {
    setVisible(false);
    alertCallback.current?.();
  }, []);

  useKeyboardShortcut({
    condition: () => visible,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut();
        onClose();
        e.preventDefault();
      }
    },
  });

  if (!visible) return null;

  return (
    <Prompt zIndex={zIndexes.ALERT} show={visible} handleClose={onClose}>
      <Box padding="20px">
        <Stack space="20px">
          <Box style={{ wordBreak: 'break-all' }}>
            <Text align="center" color="label" size="14pt" weight="medium">
              {text}
            </Text>
          </Box>
          <Inline alignHorizontal="right">
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
          </Inline>
        </Stack>
      </Box>
    </Prompt>
  );
};
