import React, { useEffect, useState } from 'react';

import { Box, Inline, Row, Rows, Text } from '~/design-system';

import { useToast } from '../../hooks/useToast';
import { zIndexes } from '../../utils/zIndexes';

export const Toast = () => {
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState<{ title: string; description?: string }>({
    title: '',
    description: '',
  });
  const { listenToast, clearToastListener } = useToast();

  listenToast(
    async ({ title, description }: { title: string; description?: string }) => {
      setText({ title, description });
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    },
  );

  useEffect(() => {
    return () => clearToastListener();
  }, [clearToastListener]);

  if (!visible) return null;
  return (
    <Box
      width="full"
      style={{ position: 'fixed', zIndex: zIndexes.TOAST, bottom: 16 }}
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
                  {text.title}
                </Text>
              </Row>
              {text.description && (
                <Row>
                  <Text
                    color="labelTertiary"
                    size="11pt"
                    weight="medium"
                    align="center"
                  >
                    {text.description}
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
