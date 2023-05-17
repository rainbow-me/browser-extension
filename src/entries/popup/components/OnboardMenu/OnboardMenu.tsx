import React from 'react';

import {
  Box,
  Column,
  Columns,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { ChevronRight } from '../ChevronRight';

const OnboardMenu = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      background="surfaceSecondaryElevated"
      borderRadius="16px"
      paddingHorizontal="20px"
    >
      {children}
    </Box>
  );
};

interface OnboardItemProps {
  onClick: () => void;
  title?: string;
  titleImage?: React.ReactNode;
  subtitle: string;
  symbol?: SymbolProps['symbol'];
  symbolColor?: SymbolProps['color'];
  testId?: string;
}

const OnboardItem = ({
  onClick,
  title,
  titleImage,
  subtitle,
  symbol,
  symbolColor,
  testId,
}: OnboardItemProps) => {
  return (
    <Box width="full" paddingVertical="20px" onClick={onClick} testId={testId}>
      <Columns alignHorizontal="center" alignVertical="center">
        <Column>
          {titleImage
            ? titleImage
            : symbol && (
                <Symbol
                  weight="semibold"
                  symbol={symbol}
                  size={20}
                  color={symbolColor}
                />
              )}
          <Box paddingTop="12px">
            <Stack space="12px">
              {title && (
                <Text size="16pt" weight="bold" color="label">
                  {title}
                </Text>
              )}
              <Text size="14pt" weight="regular" color="labelTertiary">
                {subtitle}
              </Text>
            </Stack>
          </Box>
        </Column>
        <Column width="content">
          <ChevronRight color="separatorSecondary" />
        </Column>
      </Columns>
    </Box>
  );
};

const OnboardSeparator = () => {
  return <Separator color="separatorTertiary" />;
};

OnboardMenu.Item = OnboardItem;
OnboardMenu.Separator = OnboardSeparator;

export { OnboardMenu };
