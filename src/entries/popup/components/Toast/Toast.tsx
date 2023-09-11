import EventEmitter from 'events';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { Box, Inline, Row, Rows, Text } from '~/design-system';

import { ROUTES } from '../../urls';
import { zIndexes } from '../../utils/zIndexes';
import { useCommandKStatus } from '../CommandK/useCommandKStatus';

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
  const { featureFlags } = useFeatureFlagsStore();
  const { isCommandKVisible } = useCommandKStatus();
  const location = useLocation();
  const [toastInfo, setToastInfo] = useState<ToastInfo | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const clearToastListener = toastListener(({ title, description }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToastInfo({ title, description });

      timeoutRef.current = setTimeout(() => {
        setToastInfo(null);
      }, 3000);
    });

    return () => {
      clearToastListener();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <AnimatePresence>
      {toastInfo && (
        <Box
          display="flex"
          alignItems="flex-end"
          bottom="0"
          justifyContent="center"
          paddingBottom="16px"
          width="full"
          position="absolute"
          style={{
            pointerEvents: 'none',
            zIndex: zIndexes.TOAST,
          }}
        >
          <Inline alignHorizontal="center">
            <Box
              as={motion.div}
              backdropFilter="blur(26px)"
              background="surfaceMenu"
              borderRadius="26px"
              boxShadow="24px"
              initial={{ scale: 0.5, y: 100 }}
              animate={{
                scale: 1,
                y:
                  featureFlags.new_tab_bar_enabled &&
                  location.pathname === ROUTES.HOME &&
                  !isCommandKVisible
                    ? -64
                    : 0,
              }}
              exit={{ opacity: 0, scale: 0.5, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 540,
                damping: 40,
                mass: 1.2,
              }}
              style={{
                pointerEvents: 'auto',
                willChange: 'transform',
              }}
              width="fit"
            >
              <Box paddingVertical="9px" paddingHorizontal="16px">
                <Rows space="6px">
                  <Row>
                    <Text
                      color="label"
                      size="12pt"
                      weight="bold"
                      align="center"
                    >
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
      )}
    </AnimatePresence>
  );
};
