import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import React, { CSSProperties, ReactNode } from 'react';

import { Box, Text } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { dropdownMenuItemStyles } from './DropdownMenu.css';

interface DropdownMenuContentProps {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { children, align = 'start' } = props;
  return (
    <DropdownMenuPrimitive.Portal>
      <Box
        as={DropdownMenuPrimitive.Content}
        style={{
          // All WIP styles
          border: '1px solid rgba(245, 248, 255, 0.03)',
          backgroundColor: 'rgba(53, 54, 58, 0.8)',
          width: 204,
          backdropFilter: 'blur(26px)',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)',
          borderRadius: '16px',
        }}
        paddingHorizontal="12px"
        paddingVertical="4px"
        align={align}
      >
        {children}
      </Box>
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
}

export const DropdownMenuItem = (props: DropdownMenuItemProps) => {
  const { children } = props;
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
      className={dropdownMenuItemStyles}
    >
      {children}
    </Box>
  );
};

interface DropdownMenuRadioItemProps {
  children: ReactNode;
  value: string;
}

export const DropdownMenuRadioItem = (props: DropdownMenuRadioItemProps) => {
  const { children, value } = props;
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
      className={dropdownMenuItemStyles}
    >
      {children}
    </Box>
  );
};

export const DropdownMenuSeparator = () => (
  <Box
    as={DropdownMenuPrimitive.Separator}
    style={{
      borderTop: '1px solid rgba(245, 248, 255, 0.06)',
      borderRadius: '1px',
    }}
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

export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
