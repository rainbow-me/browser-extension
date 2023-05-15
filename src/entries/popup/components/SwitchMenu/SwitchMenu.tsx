import React, { ReactNode } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { Box } from '~/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/entries/popup/components/DropdownMenu/DropdownMenu';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

interface SwitchMenuProps {
  title?: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  renderMenuTrigger: React.ReactNode;
  renderMenuItem: (item: string, i: number) => React.ReactNode;
  menuItemIndicator: React.ReactNode;
  menuItems: string[];
  align?: 'start' | 'center' | 'end';
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  controlled?: boolean;
  onClose?: () => void;
}

export const SwitchMenu = ({
  title,
  selectedValue,
  onValueChange,
  renderMenuTrigger,
  menuItems,
  renderMenuItem,
  menuItemIndicator,
  align,
  onOpenChange,
  open,
  controlled,
  onClose,
}: SwitchMenuProps) => {
  useKeyboardShortcut({
    condition: () => !!controlled,
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    },
  });
  return (
    <SwitchMenuContainer
      controlled={controlled}
      onOpenChange={onOpenChange}
      open={open}
    >
      <DropdownMenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>{renderMenuTrigger}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        onPointerDownOutside={() => {
          if (controlled) {
            onClose?.();
          }
        }}
      >
        {title ? (
          <>
            <DropdownMenuLabel>{title}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuRadioGroup
          value={selectedValue}
          onValueChange={onValueChange}
        >
          {menuItems.map((item, i) => {
            return (
              <DropdownMenuRadioItem
                key={i}
                value={item}
                selectedValue={selectedValue}
              >
                {renderMenuItem(item, i)}
                <DropdownMenuItemIndicator style={{ marginLeft: 'auto' }}>
                  {menuItemIndicator}
                </DropdownMenuItemIndicator>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </SwitchMenuContainer>
  );
};

const SwitchMenuContainer = ({
  controlled,
  children,
  onOpenChange,
  open,
}: {
  controlled?: boolean;
  children: ReactNode;
  onOpenChange?: (v: boolean) => void;
  open?: boolean;
}) => {
  if (controlled) {
    return (
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        {children}
      </DropdownMenu>
    );
  }

  return <DropdownMenu onOpenChange={onOpenChange}>{children}</DropdownMenu>;
};
