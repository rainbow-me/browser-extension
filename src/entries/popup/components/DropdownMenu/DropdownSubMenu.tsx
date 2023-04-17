import { DismissableLayerProps } from '@radix-ui/react-tooltip';
import { AnimatePresence } from 'framer-motion';
import React, { ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
} from '../DropdownMenu/DropdownMenu';

interface DropdownSubMenuProps {
  open: boolean;
  openContent: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  top?: number;
  marginLeft?: number;
  onInteractOutsideContent: DismissableLayerProps['onInteractOutside'];
}

export const DropdownSubMenu = ({
  open,
  openContent,
  subMenuElement,
  subMenuContent,
  top,
  marginLeft,
  onInteractOutsideContent,
}: DropdownSubMenuProps) => {
  return (
    <DropdownMenu open={open}>
      {subMenuElement}
      <DropdownMenuContent
        animate={false}
        key="sub-menu-element"
        top={top}
        marginLeft={marginLeft}
        border={false}
        boxShadow=""
        position="absolute"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {subMenuElement}
      </DropdownMenuContent>
      <AnimatePresence>
        {openContent && (
          <DropdownMenuContent
            animate
            key="sub-menu-content"
            top={top}
            marginLeft={marginLeft}
            position="absolute"
            onInteractOutside={onInteractOutsideContent}
          >
            {subMenuElement}
            {subMenuContent}
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
