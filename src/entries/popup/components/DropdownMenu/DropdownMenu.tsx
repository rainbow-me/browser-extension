import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import React, { CSSProperties, ReactNode } from 'react';
import { useAccount } from 'wagmi';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { AccentColorProvider, Box, Text, ThemeProvider } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  BackgroundColor,
  Space,
  globalColors,
} from '~/design-system/styles/designTokens';

import { useAvatar } from '../../hooks/useAvatar';

interface DropdownMenuTriggerProps {
  children: ReactNode;
  accentColor?: string;
  asChild?: boolean;
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { children, accentColor, asChild } = props;
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });

  return (
    <AccentColorProvider
      color={accentColor || avatar?.color || globalColors.blue60}
    >
      <DropdownMenuPrimitive.Trigger asChild={asChild}>
        {children}
      </DropdownMenuPrimitive.Trigger>
    </AccentColorProvider>
  );
}

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  marginRight?: Space;
  accentColor?: string;
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { children, align = 'start', marginRight, accentColor } = props;
  const { currentTheme } = useCurrentThemeStore();
  const { address } = useAccount();
  const { avatar } = useAvatar({ address });

  return (
    <DropdownMenuPrimitive.Portal>
      <AccentColorProvider
        color={accentColor || avatar?.color || globalColors.blue60}
      >
        <ThemeProvider theme={currentTheme}>
          <Box
            as={DropdownMenuPrimitive.Content}
            style={{
              width: 204,
              backdropFilter: 'blur(26px)',
              boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
              marginRight: marginRight ?? '0px',
            }}
            paddingHorizontal="12px"
            paddingVertical="4px"
            align={align}
            background="surfaceMenu"
            borderColor="separatorTertiary"
            borderWidth="1px"
            borderRadius="16px"
          >
            {children}
          </Box>
        </ThemeProvider>
      </AccentColorProvider>
    </DropdownMenuPrimitive.Portal>
  );
}

interface DropdownMenuLabelProps {
  children: ReactNode;
  align?: TextStyles['textAlign'];
}

export const DropdownMenuLabel = (props: DropdownMenuLabelProps) => {
  const { children, align = 'center' } = props;
  return (
    <Box as={DropdownMenuPrimitive.Label} paddingTop="8px" paddingBottom="12px">
      <Text color="label" size="14pt" weight="bold" align={align}>
        {children}
      </Text>
    </Box>
  );
};

interface DropdownMenuItemProps {
  children: ReactNode;
  onSelect?: (event: Event) => void;
}

export const DropdownMenuItem = (props: DropdownMenuItemProps) => {
  const { children, onSelect } = props;
  return (
    <Box
      as={DropdownMenuPrimitive.Item}
      paddingVertical="12px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      style={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '12px',
        outline: 'none',
      }}
      onSelect={onSelect}
      background={{
        default: 'transparent',
        hover: 'surfaceSecondary',
      }}
    >
      {children}
    </Box>
  );
};

interface DropdownMenuRadioItemProps {
  children: ReactNode;
  value: string;
  selectedValue?: string;
  selectedColor?: string;
}

export const DropdownMenuRadioItem = (props: DropdownMenuRadioItemProps) => {
  const { children, value, selectedValue, selectedColor } = props;
  return (
    <Box
      as={DropdownMenuPrimitive.RadioItem}
      value={value}
      paddingVertical="10px"
      paddingHorizontal="8px"
      marginHorizontal="-8px"
      alignItems="center"
      style={{
        display: 'flex',
        borderRadius: '12px',
        outline: 'none',
      }}
      background={{
        default:
          selectedValue === value
            ? (selectedColor as BackgroundColor) ?? 'accent'
            : 'transparent',
        hover:
          selectedValue === value
            ? (selectedColor as BackgroundColor) ?? 'accent'
            : 'surfaceSecondary',
      }}
    >
      {children}
    </Box>
  );
};

export const DropdownMenuSeparator = () => (
  <Box
    as={DropdownMenuPrimitive.Separator}
    style={{ borderRadius: 1 }}
    borderWidth="1px"
    borderColor="separatorSecondary"
  />
);

interface DropdownMenuItemIndicatorProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export const DropdownMenuItemIndicator = (
  props: DropdownMenuItemIndicatorProps,
) => {
  const { children, style, className } = props;
  return (
    <Box
      as={DropdownMenuPrimitive.DropdownMenuItemIndicator}
      className={className}
      style={style}
    >
      {children}
    </Box>
  );
};

export const DropdownMenu = (
  props: DropdownMenuPrimitive.DropdownMenuProps,
) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <DropdownMenuPrimitive.Root {...props} modal={false} />
);

export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
