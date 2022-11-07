import React from 'react';

import {
  Menu,
  MenuContent,
  MenuItemIndicator,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '../Menu/Menu';

interface SwitchMenuProps {
  title: string;
  selectedValue: string;
  onValueChange: (value: string) => void;
  renderMenuTrigger: React.ReactNode;
  renderMenuItem: (item: string, i: number) => React.ReactNode;
  menuItemIndicator: React.ReactNode;
  menuItems: string[];
}

export const SwitchMenu = ({
  title,
  selectedValue,
  onValueChange,
  renderMenuTrigger,
  menuItems,
  renderMenuItem,
  menuItemIndicator,
}: SwitchMenuProps) => {
  return (
    <Menu>
      <MenuTrigger asChild>{renderMenuTrigger}</MenuTrigger>
      <MenuContent>
        <MenuLabel>{title}</MenuLabel>
        <MenuSeparator />
        <MenuRadioGroup value={selectedValue} onValueChange={onValueChange}>
          {menuItems.map((item, i) => {
            return (
              <MenuRadioItem key={i} value={item}>
                {renderMenuItem(item, i)}
                <MenuItemIndicator style={{ marginLeft: 'auto' }}>
                  {menuItemIndicator}
                </MenuItemIndicator>
              </MenuRadioItem>
            );
          })}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
};
