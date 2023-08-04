import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useCallback } from 'react';

import { Box, Stack } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

interface DropdownSubMenuProps {
  open: boolean;
  openContent: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  position?: number;
  toggleSubMenu?: (open: boolean) => void;
  setMenuOpen?: (open: boolean) => void;
  // onInteractOutsideContent: DismissableLayerProps['onInteractOutside'];
}

const NETWORK_MENU_HEADER_X = 23;
const NETWORK_MENU_HEADER_Y = 72;
const NETWORK_MENU_HEADER_WIDTH = 190;
const NETWORK_MENU_HEADER_HEIGHT = 52;

const isClickingMenuHeader = ({
  x,
  y,
  position = 1,
}: {
  x: number;
  y: number;
  position?: number;
}) =>
  x < NETWORK_MENU_HEADER_X ||
  x > NETWORK_MENU_HEADER_X + NETWORK_MENU_HEADER_WIDTH ||
  y < NETWORK_MENU_HEADER_Y ||
  y > NETWORK_MENU_HEADER_Y + position * NETWORK_MENU_HEADER_HEIGHT;

export const DropdownSubMenu = ({
  open,
  openContent,
  subMenuElement,
  subMenuContent,
  position,
  toggleSubMenu,
  setMenuOpen,
}: DropdownSubMenuProps) => {
  const onInteractOutsideContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.preventDefault();
      const { x, y } = (e.detail.originalEvent as PointerEvent) || {};
      if (x && y) {
        toggleSubMenu?.(false);
        if (isClickingMenuHeader({ x, y, position })) {
          setMenuOpen?.(false);
        }
      }
    },
    [position, setMenuOpen, toggleSubMenu],
  );

  return (
    <DropdownMenu key="o" open={open}>
      <DropdownMenuTrigger asChild>
        <Box position="relative">{subMenuElement}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        animate={false}
        key="sub-menu-element"
        border={false}
        onInteractOutside={(e) => e.preventDefault()}
        sideOffset={-40}
        alignOffset={-12}
      >
        {subMenuElement}
      </DropdownMenuContent>
      <AnimatePresence>
        {openContent && (
          <DropdownMenuContent
            animate
            key="sub-menu-content"
            sideOffset={-40}
            alignOffset={-12}
            onInteractOutside={onInteractOutsideContent}
          >
            <Stack space="4px">
              {subMenuElement}
              <DropdownMenuSeparator />
              <Box
                as={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {subMenuContent}
              </Box>
            </Stack>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
};
