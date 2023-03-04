import React from 'react';

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
}: SwitchMenuProps) => {
  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Box style={{ cursor: 'default' }}>{renderMenuTrigger}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
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
    </DropdownMenu>
  );
};
