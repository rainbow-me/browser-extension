import { motion } from 'framer-motion';
import * as React from 'react';
import { To, useLocation, useNavigate } from 'react-router-dom';

import { Box, Button, ButtonSymbol, Inline, Text } from '~/design-system';
import { ButtonSymbolProps } from '~/design-system/components/ButtonSymbol/ButtonSymbol';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { BackgroundColor } from '~/design-system/styles/designTokens';

type NavbarProps = {
  leftComponent?: React.ReactElement;
  rightComponent?: React.ReactElement;
  title?: string;
  titleComponent?: React.ReactElement;
  background?: BackgroundColor;
};

export function Navbar({
  leftComponent,
  rightComponent,
  title,
  titleComponent,
  background,
}: NavbarProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="full"
      position="relative"
      background={background ?? undefined}
      style={{ height: 65, zIndex: 99 }}
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
            height: 32,
          }}
          height="full"
          id="navbar-left-component"
        >
          {leftComponent}
        </Box>
      )}
      {title ? (
        <Inline alignVertical="center">
          <Text size="14pt" weight="heavy" align="center">
            {title}
          </Text>
        </Inline>
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
            height: 32,
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
  height?: ButtonSymbolProps['height'];
  onClick?: () => void;
  symbol: ButtonSymbolProps['symbol'];
  variant: 'flat' | 'transparent' | 'transparentHover';
  tabIndex?: number;
  symbolSize?: SymbolProps['size'];
};

export function NavbarSymbolButton({
  height,
  onClick,
  symbol,
  variant,
  tabIndex,
  symbolSize,
}: NavbarSymbolButtonProps) {
  return (
    <ButtonSymbol
      color="surfaceSecondaryElevated"
      height={height || '32px'}
      onClick={onClick}
      symbol={symbol}
      symbolColor="labelSecondary"
      variant={variant}
      tabIndex={tabIndex}
      symbolSize={symbolSize}
    />
  );
}

function NavbarButtonWithBack({
  backTo,
  height,
  symbol,
  symbolSize,
}: {
  backTo?: To;
  height: ButtonSymbolProps['height'];
  symbol: SymbolProps['symbol'];
  symbolSize?: SymbolProps['size'];
}) {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <Box testId="navbar-button-with-back">
      <NavbarSymbolButton
        height={height}
        onClick={() => {
          if (backTo) {
            navigate(backTo, {
              state: { isBack: true, from: location.pathname },
            });
          } else {
            navigate(-1);
          }
        }}
        symbol={symbol}
        variant="transparentHover"
        symbolSize={symbolSize}
      />
    </Box>
  );
}

export function NavbarBackButton({ backTo }: { backTo?: To }) {
  return (
    <NavbarButtonWithBack
      backTo={backTo}
      height="32px"
      symbolSize={14}
      symbol="arrow.left"
    />
  );
}

export function NavbarCloseButton({ backTo }: { backTo?: To }) {
  return (
    <NavbarButtonWithBack
      backTo={backTo}
      height="32px"
      symbolSize={11}
      symbol="xmark"
    />
  );
}
