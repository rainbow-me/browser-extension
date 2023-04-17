import { DismissableLayerProps } from '@radix-ui/react-tooltip';
import { AnimatePresence } from 'framer-motion';
import React, { ReactNode } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
} from '../DropdownMenu/DropdownMenu';

interface AppConnectionSubMenuProps {
  open: boolean;
  openContent: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  onInteractOutsideContent: DismissableLayerProps['onInteractOutside'];
}

export const AppConnectionSubMenu = ({
  open,
  openContent,
  subMenuElement,
  subMenuContent,
  onInteractOutsideContent,
}: AppConnectionSubMenuProps) => {
  return (
    <DropdownMenu open={open}>
      {subMenuElement}
      <DropdownMenuContent
        animate={false}
        key="sub-menu-element"
        top={100.5}
        marginLeft={30}
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
            top={100.5}
            marginLeft={30}
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
