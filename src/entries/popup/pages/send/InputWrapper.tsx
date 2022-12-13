import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement, useState } from 'react';

import { Box, Column, Columns, Separator, Stack, Text } from '~/design-system';

import { InputActionButon } from './InputActionButton';

export const InputWrapper = ({
  leftComponent,
  centerComponent,
  showActionClose,
  onActionClose,
}: {
  leftComponent: ReactElement;
  centerComponent: ReactElement;
  showActionClose: boolean;
  onActionClose: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <Box style={{ height: 68 }}>
      <Box
        width="full"
        onClick={() => setShowDropdown(true)}
        onBlur={() => setShowDropdown(false)}
        position="absolute"
        paddingHorizontal="12px"
        style={{ left: 0 }}
      >
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingVertical="16px"
        >
          <Columns alignVertical="center" alignHorizontal="justify" space="8px">
            <Column width="content">{leftComponent}</Column>

            <Column>
              <>{centerComponent}</>
            </Column>

            <Column width="content">
              <InputActionButon
                showClose={showActionClose}
                onClose={onActionClose}
              />
            </Column>
          </Columns>

          <AnimatePresence initial={false}>
            {showDropdown && (
              <Box
                as={motion.div}
                paddingHorizontal="12px"
                style={{
                  left: 0,
                }}
                width="full"
                background="surfaceSecondaryElevated"
                key="address-dropdown"
                // position="absolute"
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    height: {
                      duration: 0.4,
                    },
                    opacity: {
                      duration: 0.2,
                      delay: 0.15,
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      duration: 0.4,
                    },
                    opacity: {
                      duration: 0.2,
                    },
                  },
                }}
              >
                <Box paddingVertical="16px">
                  <Separator />
                </Box>

                <Stack space="12px">
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                  <Text weight="bold" size="11pt">
                    AAAAAA
                  </Text>
                </Stack>
              </Box>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};
