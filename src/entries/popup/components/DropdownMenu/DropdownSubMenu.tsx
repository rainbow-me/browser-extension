import EventEmitter from 'events';

import { AnimatePresence, motion } from 'framer-motion';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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

const eventEmitter = new EventEmitter();

const subMenuListener = (callback: ({ open }: { open: boolean }) => void) => {
  eventEmitter.addListener('sub_menu_listener', callback);
  return () => {
    eventEmitter.removeListener('sub_menu_listener', callback);
  };
};

const triggerSubMenuListener = ({ open }: { open: boolean }) => {
  eventEmitter.emit('sub_menu_listener', { open });
};

export const DropdownMenuContentWithSubMenu = ({
  align,
  children,
  sideOffset,
}: {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const parentRef = useRef<HTMLDivElement | null>(null);

  const clearSubMenuListener = subMenuListener(({ open }) =>
    setSubMenuOpen(open),
  );
  useEffect(() => {
    return () => {
      clearSubMenuListener();
    };
  }, [clearSubMenuListener]);

  return (
    <DropdownMenuContent
      scale={subMenuOpen ? 0.94 : 1}
      sideOffset={sideOffset}
      align={align}
    >
      <Box ref={parentRef} id="desired-tree">
        {children}
      </Box>
    </DropdownMenuContent>
  );
};

interface DropdownSubMenuProps {
  subMenuOpen: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  position?: number;
  setSubMenuOpen?: (open: boolean) => void;
}

export const DropdownSubMenu = ({
  subMenuOpen,
  subMenuElement,
  subMenuContent,
  position,
  setSubMenuOpen,
}: DropdownSubMenuProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    setTimeout(
      () => {
        setMenuOpen(subMenuOpen);
      },
      subMenuOpen ? 0 : 250,
    );
  }, [subMenuOpen]);

  useEffect(() => {
    triggerSubMenuListener({ open: subMenuOpen });
  }, [subMenuOpen]);

  return (
    <DropdownMenu open={menuOpen}>
      <DropdownMenuTrigger asChild>
        <Box id="sub-menu" position="relative">
          {subMenuElement}
        </Box>
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
