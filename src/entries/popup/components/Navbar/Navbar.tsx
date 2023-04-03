import { motion } from 'framer-motion';
import * as React from 'react';
import { To, useLocation, useNavigate } from 'react-router-dom';

import { Box, Button, ButtonSymbol, Inline, Text } from '~/design-system';
import { ButtonSymbolProps } from '~/design-system/components/ButtonSymbol/ButtonSymbol';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { BackgroundColor } from '~/design-system/styles/designTokens';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

type NavbarProps = {
  leftComponent?: React.ReactElement;
  rightComponent?: React.ReactElement;
  title?: string;
  titleTestId?: string;
  titleComponent?: React.ReactElement;
  background?: BackgroundColor;
};

export function Navbar({
  leftComponent,
  rightComponent,
  title,
  titleTestId,
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
      style={{ height: 65, zIndex: zIndexes.NAVBAR }}
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
          <Text testId={titleTestId} size="14pt" weight="heavy" align="center">
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
  onClick,
  symbol,
  symbolSize,
  testId,
}: {
  backTo?: To;
  height: ButtonSymbolProps['height'];
  onClick?: () => void;
  symbol: SymbolProps['symbol'];
  symbolSize?: SymbolProps['size'];
  testId?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const click = React.useCallback(() => {
    if (onClick) {
      onClick();
    } else if (backTo) {
      navigate(backTo, {
        state: { isBack: true, from: location.pathname },
      });
    } else {
      navigate(-1);
    }
  }, [backTo, location.pathname, navigate, onClick]);

  return (
    <Box
      testId={`navbar-button-with-back${testId ? `-${testId}` : ``}`}
      style={{ zIndex: 20 }}
    >
      <NavbarSymbolButton
        height={height}
        onClick={click}
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

export function NavbarCloseButton({
  backTo,
  onClick,
  testId,
}: {
  backTo?: To;
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <NavbarButtonWithBack
      onClick={onClick}
      backTo={backTo}
      height="32px"
      symbolSize={11}
      symbol="xmark"
      testId={testId}
    />
  );
}
