import { ReactNode } from 'react';

import { Stack, Symbol, Text } from '~/design-system';

type ErrorStateProps = {
  headerText: string;
  descriptionText: string;
  children: ReactNode;
};

export const ErrorState = ({
  headerText,
  descriptionText,
  children,
}: ErrorStateProps) => {
  return (
    <Stack
      alignHorizontal="center"
      gap="16px"
      padding="24px"
      paddingTop="48px"
      paddingBottom="60px"
    >
      <Symbol
        symbol="exclamationmark.triangle.fill"
        size={34}
        color="labelQuaternary"
      />
      <Stack alignHorizontal="center" gap="16px">
        <Text align="center" size="16pt" weight="bold" color="label">
          {headerText}
        </Text>
        <Text
          align="center"
          size="14pt"
          weight="semibold"
          color="labelTertiary"
          whiteSpace="pre-wrap"
        >
          {descriptionText}
        </Text>
        {children}
      </Stack>
    </Stack>
  );
};
