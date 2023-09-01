import EventEmitter from 'events';

import { useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

interface AlertProps {
  text: string;
  callback?: () => void;
}

const eventEmitter = new EventEmitter();

const listenAlert = (callback: ({ text, callback }: AlertProps) => void) => {
  eventEmitter.addListener('rainbow_alert', callback);
  return () => {
    eventEmitter.removeListener('rainbow_alert', callback);
  };
};

export const triggerAlert = ({ text, callback }: AlertProps) => {
  eventEmitter.emit('rainbow_alert', { text, callback });
};

export const Alert = () => {
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const { trackShortcut } = useKeyboardAnalytics();

  const visible = !!alert;

  useEffect(() => listenAlert(setAlert), []);

  const onClose = () => {
    alert?.callback?.();
    setAlert(null);
  };

  useKeyboardShortcut({
    condition: () => visible,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut({
          key: shortcuts.global.CLOSE.display,
          type: 'alert.dismiss',
        });
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
          <Box style={{ wordBreak: 'break-word' }}>
            <Text align="center" color="label" size="14pt" weight="medium">
              {alert.text}
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
