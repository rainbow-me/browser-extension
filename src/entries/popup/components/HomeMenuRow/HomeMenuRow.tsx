import React, { ReactElement } from 'react';

import { Box, Column, Columns } from '~/design-system';

export const HomeMenuRow = ({
  leftComponent,
  centerComponent,
  rightComponent,
  testId,
}: {
  leftComponent: ReactElement;
  centerComponent: ReactElement;
  rightComponent: ReactElement;
  testId?: string;
}) => {
  return (
    <Box testId={testId} width="full">
      <Columns alignVertical="center" space="8px">
        <Column width="content">{leftComponent}</Column>
        <Column>
          <Columns alignVertical="center" space="8px">
            <Column>{centerComponent}</Column>
            <Column width="content">{rightComponent}</Column>
          </Columns>
        </Column>
      </Columns>
    </Box>
  );
};
