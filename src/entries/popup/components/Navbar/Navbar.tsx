import * as React from 'react';

import { Box, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

import { navbarButtonStyles } from './Navbar.css';

type NavbarProps = {
  leftComponent?: React.ReactElement;
  rightComponent?: React.ReactElement;
  title?: string;
  titleComponent?: React.ReactElement;
};

export function Navbar({
  leftComponent,
  rightComponent,
  title,
  titleComponent,
}: NavbarProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      padding="16px"
      width="full"
      position="relative"
      height="full"
    >
      {leftComponent && (
        <Box position="absolute" left="0" top="0" padding="16px" height="full">
          {leftComponent}
        </Box>
      )}
      {title ? (
        <Box style={{ textAlign: 'center' }}>
          <Text size="14pt" weight="heavy">
            {title}
          </Text>
        </Box>
      ) : (
        titleComponent
      )}
      {rightComponent && (
        <Box position="absolute" right="0" top="0" padding="16px" height="full">
          {rightComponent}
        </Box>
      )}
    </Box>
  );
}

Navbar.BackButton = NavbarBackButton;
Navbar.SymbolButton = NavbarSymbolButton;

type NavbarButtonProps = {
  children: React.ReactNode;
  variant?: 'default' | 'ghost';
};

// TODO: Refactor to use generic DS Button.
export function NavbarButton({
  children,
  variant = 'default',
}: NavbarButtonProps) {
  return (
    <Box
      className={navbarButtonStyles[variant]}
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

type NavbarSymbolButtonProps = {
  symbol: SymbolProps['symbol'];
};

export function NavbarSymbolButton({ symbol }: NavbarSymbolButtonProps) {
  return (
    <NavbarButton>
      <Symbol
        color="labelSecondary"
        symbol={symbol}
        size={16}
        weight="semibold"
      />
    </NavbarButton>
  );
}

export function NavbarBackButton() {
  return (
    <NavbarButton variant="ghost">
      <Symbol
        color="labelSecondary"
        symbol="arrow.left"
        size={16}
        weight="semibold"
      />
    </NavbarButton>
  );
}
