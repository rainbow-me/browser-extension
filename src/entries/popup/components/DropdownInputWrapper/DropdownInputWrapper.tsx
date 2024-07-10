import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactElement } from 'react';

import {
  Box,
  Column,
  Columns,
  Row,
  Rows,
  Separator,
  Stack,
} from '~/design-system';

const TRANSITION_CONFIG = {
  height: {
    type: 'spring',
    stiffness: 540,
    damping: 40,
    mass: 1.2,
  },
};

export const dropdownContainerVariant = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const dropdownItemVariant = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

interface DropdownInputWrapperProps {
  borderVisible?: boolean;
  bottomComponent?: ReactElement | null;
  centerComponent: ReactElement;
  dropdownComponent: ReactElement;
  dropdownHeight?: number;
  dropdownVisible: boolean;
  leftComponent: ReactElement;
  rightComponent: ReactElement;
  testId?: string;
  zIndex?: number;
}

export const DropdownInputWrapper = ({
  bottomComponent,
  leftComponent,
  centerComponent,
  rightComponent,
  dropdownComponent,
  dropdownVisible,
  zIndex,
  dropdownHeight,
  testId,
  borderVisible = true,
}: DropdownInputWrapperProps) => {
  return (
    <Box style={{ height: bottomComponent ? 92 : 68 }}>
      <Box width="full" position="relative" style={{ zIndex: zIndex ?? 1 }}>
        <Box
          height="full"
          background="surfaceSecondaryElevated"
          borderRadius="24px"
          paddingHorizontal="20px"
          paddingTop="16px"
          borderWidth={borderVisible ? '1px' : undefined}
          borderColor="buttonStroke"
          as={motion.div}
          layout="position"
        >
          <Box testId={`input-wrapper-dropdown-${testId}`}>
            <Rows space="16px">
              <Row>
                <Columns
                  alignVertical="center"
                  alignHorizontal="justify"
                  space="8px"
                >
                  <Column width="content">{leftComponent}</Column>

                  <Column>
                    <Box>{centerComponent}</Box>
                  </Column>

                  <Column width="content">{rightComponent}</Column>
                </Columns>
              </Row>
              {!!bottomComponent && (
                <Row>
                  <Box>{bottomComponent}</Box>
                </Row>
              )}
            </Rows>
          </Box>

          <Box
            as={motion.div}
            width="full"
            height="full"
            background="surfaceSecondaryElevated"
            key="address-dropdown"
            initial={{ height: 16 }}
            style={{ overflowY: 'clip' }}
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
                      overflow: 'hidden',
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
