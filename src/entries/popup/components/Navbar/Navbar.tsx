import { motion } from 'framer-motion';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { shortcuts } from '~/core/references/shortcuts';
import { Box, Button, ButtonSymbol, Inline, Text } from '~/design-system';
import { ButtonSymbolProps } from '~/design-system/components/ButtonSymbol/ButtonSymbol';
import { SymbolProps } from '~/design-system/components/Symbol/Symbol';
import { BackgroundColor } from '~/design-system/styles/designTokens';
import { zIndexes } from '~/entries/popup/utils/zIndexes';

import useKeyboardAnalytics from '../../hooks/useKeyboardAnalytics';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useRainbowNavigate } from '../../hooks/useRainbowNavigate';
import {
  getActiveModal,
  getInputIsFocused,
  radixIsActive,
} from '../../utils/activeElement';
import {
  NAVBAR_LEFT_COMPONENT_ID,
  NAVBAR_RIGHT_COMPONENT_ID,
} from '../../utils/clickHeader';

export const NAVBAR_HEIGHT = 64;

type NavbarProps = {
  leftComponent?: React.ReactElement;
  rightComponent?: React.ReactElement;
  title?: string;
  titleTestId?: string;
  titleComponent?: React.ReactNode;
  background?: BackgroundColor;
  style?: React.CSSProperties;
};

export function Navbar({
  leftComponent,
  rightComponent,
  title,
  titleTestId,
  titleComponent,
  background,
  style = {},
}: NavbarProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      width="full"
      position="relative"
      background={background ?? undefined}
      style={{
        height: NAVBAR_HEIGHT,
        minHeight: NAVBAR_HEIGHT,
        zIndex: zIndexes.NAVBAR,
        ...style,
      }}
    >
      {leftComponent && (
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 1111, damping: 50, mass: 1 }}
          exit={{ opacity: 0 }}
          position="absolute"
          style={{
            left: 16,
            top: 16,
            height: 32,
          }}
          height="full"
          id={NAVBAR_LEFT_COMPONENT_ID}
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
          transition={{ type: 'spring', stiffness: 1111, damping: 50, mass: 1 }}
          exit={{ opacity: 0 }}
          position="absolute"
          style={{
            right: 16,
            top: 16,
            height: 32,
          }}
          height="full"
          id={NAVBAR_RIGHT_COMPONENT_ID}
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
  height,
  onClick,
  symbol,
  symbolSize,
  testId,
  variant = 'flat',
  withinModal,
}: {
  height: ButtonSymbolProps['height'];
  onClick?: () => void;
  symbol: SymbolProps['symbol'];
  symbolSize?: SymbolProps['size'];
  testId?: string;
  variant?: 'flat' | 'transparent' | 'transparentHover';
  withinModal?: boolean;
}) {
  const { state } = useLocation();
  const { trackShortcut } = useKeyboardAnalytics();
  const navigate = useRainbowNavigate();

  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      const closeWithEscape =
        e.key === shortcuts.global.CLOSE.key &&
        !radixIsActive() &&
        (withinModal || !getActiveModal());
      const keyIsBack =
        e.key === shortcuts.global.BACK.key ||
        e.key === shortcuts.global.CLOSE.key;
      if (closeWithEscape || (!getInputIsFocused() && keyIsBack)) {
        trackShortcut({
          key: closeWithEscape
            ? shortcuts.global.CLOSE.display
            : shortcuts.global.BACK.display,
          type: 'navbar.goBack',
        });
        e.preventDefault();
        e.stopPropagation();
        click();
      }
    },
  });

  const click = React.useCallback(() => {
    if (onClick) {
      onClick();
    } else if (state?.backTo) {
      navigate(state?.backTo, { replace: true });
    } else {
      const popDiff = typeof state?.popTo === 'number' ? state?.popTo : -1;
      navigate(popDiff);
    }
  }, [navigate, onClick, state]);

  return (
    <Box
      testId={`navbar-button-with-back${testId ? `-${testId}` : ``}`}
      style={{ zIndex: 20 }}
    >
      <NavbarSymbolButton
        height={height}
        onClick={click}
        symbol={symbol}
        variant={variant}
        symbolSize={symbolSize}
        tabIndex={0}
      />
    </Box>
  );
}

export function NavbarBackButton({
  onClick,
  withinModal,
  variant,
}: {
  onClick?: () => void;
  withinModal?: boolean;
  variant?: 'flat' | 'transparent' | 'transparentHover';
}) {
  return (
    <NavbarButtonWithBack
      onClick={onClick}
      height="32px"
      symbolSize={14}
      symbol="arrow.left"
      withinModal={withinModal}
      variant={variant}
    />
  );
}

export function NavbarCloseButton({
  onClick,
  testId,
  variant,
  withinModal,
}: {
  onClick?: () => void;
  testId?: string;
  variant?: 'flat' | 'transparent' | 'transparentHover';
  withinModal?: boolean;
}) {
  return (
    <NavbarButtonWithBack
      onClick={onClick}
      height="32px"
      symbolSize={11}
      symbol="xmark"
      testId={testId}
      variant={variant}
      withinModal={withinModal}
    />
  );
}
