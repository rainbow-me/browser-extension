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
  console.log('-- showDropdown', showDropdown);
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
          as={motion.div}
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingTop="16px"
          paddingBottom="8px"
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
            {!showDropdown && (
              <Box
                as={motion.div}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 8,
                  transition: {
                    height: {
                      duration: 0.1,
                      delay: 0.2,
                    },
                    opacity: {
                      duration: 0.05,
                      delay: 0.2,
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      duration: 0.1,
                    },
                    opacity: {
                      duration: 0.05,
                    },
                  },
                }}
                key="2"
                style={{ height: 0 }}
              />
            )}

            {showDropdown && (
              <Box
                as={motion.div}
                paddingHorizontal="12px"
                style={{
                  left: 0,
                }}
                transition={{ type: 'spring', bounce: 1 }}
                width="full"
                background="surfaceSecondaryElevated"
                key="address-dropdown"
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                  transition: {
                    height: {
                      duration: 0.2,
                    },
                    opacity: {
                      duration: 0.1,
                    },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  transition: {
                    height: {
                      duration: 0.2,
                    },
                    opacity: {
                      duration: 0.1,
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
