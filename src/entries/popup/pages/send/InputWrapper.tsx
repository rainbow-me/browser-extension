import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement, useCallback, useState } from 'react';

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
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const openDropdown = useCallback(
    () => setDropdownVisible((dropdownVisible) => !dropdownVisible),
    [],
  );

  return (
    <Box style={{ height: 68 }}>
      <Box width="full" position="relative" style={{ zIndex: 1 }}>
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingTop="16px"
          paddingBottom="8px"
          height="full"
        >
          <Box onClick={openDropdown}>
            <Columns
              alignVertical="center"
              alignHorizontal="justify"
              space="8px"
            >
              <Column width="content">{leftComponent}</Column>

              <Column>
                <>{centerComponent}</>
              </Column>

              <Column width="content">
                <InputActionButon
                  showClose={showActionClose}
                  onClose={onActionClose}
                  dropdownVisible={dropdownVisible}
                />
              </Column>
            </Columns>
          </Box>

          <Box
            as={motion.div}
            paddingHorizontal="12px"
            width="full"
            height="full"
            background="surfaceSecondaryElevated"
            key="address-dropdown"
            initial={{ height: 8 }}
            animate={
              dropdownVisible
                ? {
                    height: 'auto',
                    transition: {
                      height: {
                        type: 'spring',
                        stiffness: 540,
                        damping: 40,
                        mass: 1.2,
                      },
                    },
                  }
                : {
                    height: 8,
                    transition: {
                      height: {
                        type: 'spring',
                        stiffness: 540,
                        damping: 40,
                        mass: 1.2,
                      },
                    },
                  }
            }
          >
            <AnimatePresence>
              {dropdownVisible && (
                <>
                  <Box paddingVertical="16px">
                    <Separator />
                  </Box>
                  <Box style={{ maxHeight: 430, overflow: 'scroll' }}>
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
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>{' '}
                      <Text weight="bold" size="11pt">
                        AAAAAA
                      </Text>
                    </Stack>
                  </Box>
                </>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
