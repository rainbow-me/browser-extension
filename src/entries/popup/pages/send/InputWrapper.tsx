import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement, useState } from 'react';

import { Box, Column, Columns, Text } from '~/design-system';

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
    <Box
      background="surfaceSecondaryElevated"
      paddingVertical="20px"
      paddingHorizontal="16px"
      borderRadius="24px"
      width="full"
      onClick={() => setShowDropdown(true)}
      onBlur={() => setShowDropdown(false)}
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
            position="absolute"
            key="address-dropdown"
            initial={{ opacity: 0, height: 0 }}
            animate={{
              opacity: 1,
              height: 'auto',
              transition: {
                height: {
                  duration: 0.4,
                },
                opacity: {
                  duration: 0.25,
                  delay: 0.15,
                },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              transition: {
                height: {
                  duration: 0.25,
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
          >
            <Box
              background="surfaceSecondaryElevated"
              width="full"
              style={{
                height: 200,
                borderEndEndRadius: 24,
                borderEndStartRadius: 24,
              }}
            >
              <Text weight="bold" size="11pt">
                AAAAAA
              </Text>
              <Text weight="bold" size="11pt">
                AAAAAA
              </Text>
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};
