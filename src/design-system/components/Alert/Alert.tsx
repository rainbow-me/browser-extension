import EventEmitter from 'events';

import { useCallback, useEffect, useState } from 'react';

import { i18n } from '~/core/languages';
import { shortcuts } from '~/core/references/shortcuts';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import useKeyboardAnalytics from '~/entries/popup/hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '~/entries/popup/hooks/useKeyboardShortcut';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

interface AlertProps {
  action?: () => void;
  actionText?: string;
  callback?: () => void;
  text: string;
  description?: string;
}

const eventEmitter = new EventEmitter();

const listenAlert = (callback: ({ text, callback }: AlertProps) => void) => {
  eventEmitter.addListener('rainbow_alert', callback);
  return () => {
    eventEmitter.removeListener('rainbow_alert', callback);
  };
};

export const triggerAlert = ({
  action,
  actionText,
  text,
  description,
  callback,
}: AlertProps) => {
  eventEmitter.emit('rainbow_alert', {
    action,
    actionText,
    text,
    description,
    callback,
  });
};

export const Alert = () => {
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const { trackShortcut } = useKeyboardAnalytics();

  const visible = !!alert;

  useEffect(() => listenAlert(setAlert), []);

  const onAction = () => {
    alert?.action?.();
    setAlert(null);
  };

  const onClose = useCallback(() => {
    alert?.callback?.();
    setAlert(null);
  }, [alert]);

  const handleShortcut = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        trackShortcut({
          key: shortcuts.global.CLOSE.display,
          type: 'alert.dismiss',
        });
        onClose();
        e.preventDefault();
      }
    },
    [onClose, trackShortcut],
  );

  useKeyboardShortcut({
    condition: visible,
    handler: handleShortcut,
  });

  if (!visible) return null;

  return (
    <Prompt zIndex={zIndexes.ALERT} show={visible} handleClose={onClose}>
      <Box padding="20px">
        <Stack space="20px">
          <Box style={{ wordBreak: 'break-word' }}>
            <Stack space="12px">
              <Text align="center" color="label" size="14pt" weight="medium">
                {alert.text}
              </Text>
              {alert.description && (
                <Text align="center" color="label" size="12pt" weight="regular">
                  {alert.description}
                </Text>
              )}
            </Stack>
          </Box>
          {alert?.action && alert?.actionText && (
            <Inline alignHorizontal="right">
              <Button
                width="full"
                color="accent"
                height="28px"
                variant="flat"
                onClick={onAction}
                tabIndex={0}
              >
                <Text color="label" size="16pt" weight="bold">
                  {alert.actionText}
                </Text>
              </Button>
            </Inline>
          )}
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
