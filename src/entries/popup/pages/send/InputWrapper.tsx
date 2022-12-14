import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement } from 'react';

import { Box, Column, Columns, Separator, Stack } from '~/design-system';

import { InputActionButon } from './InputActionButton';

const TRANSITION_CONFIG = {
  height: {
    type: 'spring',
    stiffness: 540,
    damping: 40,
    mass: 1.2,
  },
};

export const InputWrapper = ({
  leftComponent,
  centerComponent,
  dropdownContent,
  dropdownVisible,
  showActionClose,
  onActionClose,
  onDropdownAction,
}: {
  leftComponent: ReactElement;
  centerComponent: ReactElement;
  dropdownContent: ReactElement;
  showActionClose: boolean;
  dropdownVisible: boolean;
  onActionClose: () => void;
  onDropdownAction: () => void;
}) => {
  return (
    <Box style={{ height: 68 }}>
      <Box width="full" position="relative" style={{ zIndex: 1 }}>
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingTop="16px"
          height="full"
        >
          <Box onClick={onDropdownAction}>
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
            width="full"
            height="full"
            background="surfaceSecondaryElevated"
            key="address-dropdown"
            initial={{ height: 16 }}
            animate={
              dropdownVisible
                ? {
                    height: 'auto',
                    transition: TRANSITION_CONFIG,
                  }
                : {
                    height: 16,
                    transition: TRANSITION_CONFIG,
                  }
            }
          >
            <AnimatePresence>
              {dropdownVisible && (
                <Box>
                  <Box paddingTop="16px">
                    <Separator />
                  </Box>
                  <Box
                    style={{ maxHeight: 430, overflow: 'scroll' }}
                    paddingVertical="16px"
                  >
                    <Stack space="12px">{dropdownContent}</Stack>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
