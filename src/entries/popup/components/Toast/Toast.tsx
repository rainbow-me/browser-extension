import EventEmitter from 'events';

import { useEffect, useState } from 'react';

import { Box, Inline, Row, Rows, Text } from '~/design-system';

import { zIndexes } from '../../utils/zIndexes';

const eventEmitter = new EventEmitter();

type ToastInfo = { title: string; description?: string };

const toastListener = (
  callback: ({ title, description }: ToastInfo) => void,
) => {
  eventEmitter.addListener('rainbow_toast', callback);
  return () => {
    eventEmitter.removeListener('rainbow_toast', callback);
  };
};

export const triggerToast = ({ title, description }: ToastInfo) => {
  eventEmitter.emit('rainbow_toast', { title, description });
};

export const Toast = () => {
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const clearToastListener = toastListener(({ title, description }) => {
      setToastInfo({ title, description });
      timeout = setTimeout(() => {
        setToastInfo(null);
      }, 3000);
    });

    return () => {
      clearToastListener();
      clearTimeout(timeout);
    };
  }, []);

  if (!toastInfo) return null;
  return (
    <Box
      width="full"
      position="sticky"
      bottom="16px"
      style={{ zIndex: zIndexes.TOAST }}
    >
      <Inline alignHorizontal="center">
        <Box
          borderRadius="26px"
          background="surfaceMenu"
          width="fit"
          backdropFilter="blur(26px)"
        >
          <Box paddingVertical="8px" paddingHorizontal="16px">
            <Rows space="6px">
              <Row>
                <Text color="label" size="12pt" weight="bold" align="center">
                  {toastInfo.title}
                </Text>
              </Row>
              {toastInfo.description && (
                <Row>
                  <Text
                    color="labelTertiary"
                    size="11pt"
                    weight="medium"
                    align="center"
                  >
                    {toastInfo.description}
                  </Text>
                </Row>
              )}
            </Rows>
          </Box>
        </Box>
      </Inline>
    </Box>
  );
};
