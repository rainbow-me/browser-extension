import * as React from 'react';

import { Box, Text } from '~/design-system';

import { SFSymbol, SFSymbolProps } from '../SFSymbol/SFSymbol';

import { pageHeaderButtonStyles } from './PageHeader.css';

type PageHeaderProps = {
  leftComponent?: React.ReactElement;
  rightComponent?: React.ReactElement;
  title?: string;
};

export function PageHeader({
  leftComponent,
  rightComponent,
  title,
}: PageHeaderProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding="16px"
      width="full"
      position="relative"
      style={{ height: 64 }}
    >
      {leftComponent && (
        <Box position="absolute" left="0" top="0" padding="16px" height="full">
          {leftComponent}
        </Box>
      )}
      {title && (
        <Box style={{ textAlign: 'center' }}>
          <Text size="14pt" weight="heavy">
            {title}
          </Text>
        </Box>
      )}
      {rightComponent && (
        <Box position="absolute" right="0" top="0" padding="16px" height="full">
          {rightComponent}
        </Box>
      )}
    </Box>
  );
}

PageHeader.BackButton = PageHeaderBackButton;
PageHeader.SymbolButton = PageHeaderSymbolButton;

type PageHeaderButtonProps = {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
};

// TODO: Refactor to use generic DS Button.
export function PageHeaderButton({
  children,
  variant = 'default',
}: PageHeaderButtonProps) {
  return (
    <Box
      className={pageHeaderButtonStyles[variant]}
      borderRadius="round"
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ width: 32, height: 32 }}
    >
      {children}
    </Box>
  );
}

type PageHeaderSymbolButtonProps = {
  symbol: SFSymbolProps['symbol'];
};

export function PageHeaderSymbolButton({
  symbol,
}: PageHeaderSymbolButtonProps) {
  return (
    <PageHeaderButton>
      <SFSymbol color="labelSecondary" symbol={symbol} size={17} />
    </PageHeaderButton>
  );
}

export function PageHeaderBackButton() {
  return (
    <PageHeaderButton variant="ghost">
      <SFSymbol color="labelSecondary" symbol="arrowLeft" size={15} />
    </PageHeaderButton>
  );
}
