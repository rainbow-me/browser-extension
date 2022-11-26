import { motion } from 'framer-motion';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Button, Symbol, Text } from '~/design-system';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';

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
      width="full"
      position="relative"
      style={{ height: 65 }}
    >
      {leftComponent && (
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          exit={{ opacity: 0 }}
          position="absolute"
          style={{
            left: 15,
            top: 17,
          }}
          height="full"
        >
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
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
          exit={{ opacity: 0 }}
          position="absolute"
          style={{
            right: 15,
            top: 17,
          }}
          height="full"
        >
          {rightComponent}
        </Box>
      )}
    </Box>
  );
}

Navbar.BackButton = NavbarBackButton;
Navbar.CloseButton = NavbarCloseButton;
Navbar.SymbolButton = NavbarSymbolButton;

type NavbarButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'transparent' | 'flat';
};

// TODO: Refactor to use generic DS Button.
export function NavbarButton({
  children,
  onClick,
  variant = 'transparent',
}: NavbarButtonProps) {
  return (
    <Button
      height="32px"
      onClick={onClick}
      variant={variant}
      color="surfaceSecondaryElevated"
    >
      {children}
    </Button>
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

function NavbarButtonWithGoBack({ symbol }: { symbol: SymbolProps['symbol'] }) {
  const navigate = useNavigate();
  return (
    <NavbarButton variant="transparent" onClick={() => navigate(-1)}>
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
  return <NavbarButtonWithGoBack symbol="arrowLeft" />;
}

export function NavbarCloseButton() {
  return <NavbarButtonWithGoBack symbol="xmark" />;
}
