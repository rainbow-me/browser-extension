import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useCallback } from 'react';

import { Box, Stack } from '~/design-system';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';

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

export const DropdownMenuContentWithSubMenu = ({
  align,
  children,
  subMenuOpen,
  sideOffset,
}: {
  children: ReactNode;
  subMenuOpen: boolean;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) => {
  return (
    <DropdownMenuContent
      scale={subMenuOpen ? 0.94 : 1}
      sideOffset={sideOffset}
      align={align}
    >
      {children}
    </DropdownMenuContent>
  );
};

interface DropdownSubMenuProps {
  menuOpen: boolean;
  subMenuOpen: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  position?: number;
  setSubMenuOpen?: (open: boolean) => void;
  setMenuOpen?: (open: boolean) => void;
}

export const DropdownSubMenu = ({
  menuOpen,
  subMenuOpen,
  subMenuElement,
  subMenuContent,
  position,
  setSubMenuOpen,
  setMenuOpen,
}: DropdownSubMenuProps) => {
  const onInteractOutsideContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.preventDefault();
      const { x, y } = (e.detail.originalEvent as PointerEvent) || {};
      if (x && y) {
        setSubMenuOpen?.(false);
        if (isClickingMenuHeader({ x, y, position })) {
          setMenuOpen?.(false);
        }
      }
    },
    [position, setMenuOpen, setSubMenuOpen],
  );

  return (
    <DropdownMenu open={menuOpen}>
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
        {subMenuOpen && (
          <DropdownMenuContent
            animate
            border={false}
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
