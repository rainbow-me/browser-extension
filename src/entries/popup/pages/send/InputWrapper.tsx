import React, { ReactElement } from 'react';

import { Box, Column, Columns } from '~/design-system';

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
  return (
    <Box
      background="surfaceSecondaryElevated"
      paddingVertical="20px"
      paddingHorizontal="16px"
      borderRadius="24px"
      width="full"
    >
      <Columns alignVertical="center" alignHorizontal="justify" space="8px">
        <Column width="content">{leftComponent}</Column>

        <Column>{centerComponent}</Column>

        <Column width="content">
          <InputActionButon
            showClose={showActionClose}
            onClose={onActionClose}
          />
        </Column>
      </Columns>
    </Box>
  );
};
