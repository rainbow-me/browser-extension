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
  dropdownComponent,
  dropdownVisible,
  showActionClose,
  onActionClose,
  onDropdownAction,
  zIndex,
  dropdownHeight,
}: {
  leftComponent: ReactElement;
  centerComponent: ReactElement;
  dropdownComponent: ReactElement;
  showActionClose: boolean;
  dropdownVisible: boolean;
  onActionClose: () => void;
  onDropdownAction: () => void;
  zIndex?: number;
  dropdownHeight?: number;
}) => {
  return (
    <Box style={{ height: 68 }}>
      <Box width="full" position="relative" style={{ zIndex: zIndex ?? 1 }}>
        <Box
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingTop="16px"
          height="full"
          borderWidth="1px"
          borderColor="buttonStroke"
        >
          <Box>
            <Columns
              alignVertical="center"
              alignHorizontal="justify"
              space="8px"
            >
              <Column width="content">{leftComponent}</Column>

              <Column>
                <Box onClick={onDropdownAction}>{centerComponent}</Box>
              </Column>

              <Column width="content">
                <InputActionButon
                  showClose={showActionClose}
                  onClose={onActionClose}
                  onDropdownAction={onDropdownAction}
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
                <Box
                  as={motion.div}
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  marginHorizontal="-20px"
                >
                  <Box paddingHorizontal="20px" paddingTop="16px">
                    <Separator />
                  </Box>
                  <Box
                    style={{
                      height: dropdownHeight ?? 452,
                      overflow: 'scroll',
                    }}
                    paddingVertical="16px"
                  >
                    <Stack space="12px">{dropdownComponent}</Stack>
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
