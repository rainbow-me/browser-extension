import EventEmitter from 'events';

import { AnimatePresence, motion } from 'framer-motion';
import React, {
  ReactElement,
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

// in order to get the header width we need to scale down the
// context menu by 0.94, and also consider the additional horizontal
// padding scaled down which (204 - 204*0.94) / 2
const NETWORK_MENU_HEADER_WIDTH = 204 * 0.94;
const ADDITIONAL_HORIZONTAL_PADDING = (204 - NETWORK_MENU_HEADER_WIDTH) / 2;
// we also need an additional vertical padding for the same reason
const ADDITIONAL_VERTICAL_PADDING = 6;

const isClickingMenuHeader = ({
  x,
  y,
  subMenuRect,
  parentRect,
}: {
  x: number;
  y: number;
  subMenuRect: DOMRect;
  parentRect: DOMRect;
}) =>
  x <
    subMenuRect.x - ADDITIONAL_HORIZONTAL_PADDING + NETWORK_MENU_HEADER_WIDTH &&
  x > subMenuRect.x - ADDITIONAL_HORIZONTAL_PADDING &&
  y < subMenuRect.y &&
  y > parentRect.y + ADDITIONAL_VERTICAL_PADDING;

const eventEmitter = new EventEmitter();

export const subMenuListener = (
  callback: ({ open }: { open: boolean }) => void,
) => {
  eventEmitter.addListener('sub_menu_listener', callback);
  return () => {
    eventEmitter.removeListener('sub_menu_listener', callback);
  };
};

export const triggerSubMenuListener = ({ open }: { open: boolean }) => {
  eventEmitter.emit('sub_menu_listener', { open });
};

export const DropdownMenuContentWithSubMenu = ({
  align,
  children,
  sideOffset,
  subMenuRef,
}: {
  children: ReactElement;
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  subMenuRef: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const clearSubMenuListener = subMenuListener(({ open }) =>
    setSubMenuOpen(open),
  );
  useEffect(() => {
    return () => {
      clearSubMenuListener();
    };
  }, [clearSubMenuListener]);

  return (
    <Box ref={subMenuRef}>
      <DropdownMenuContent
        scale={subMenuOpen ? 0.94 : 1}
        sideOffset={sideOffset}
        align={align}
      >
        {children}
      </DropdownMenuContent>
    </Box>
  );
};

const SUBMENU_SIDE_OFFSET = -38;
const SUBMENU_ALIGN_OFFSET = -12;

interface DropdownSubMenuProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  subMenuOpen: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  parentRef?: React.MutableRefObject<HTMLDivElement | null>;
  setSubMenuOpen?: (open: boolean) => void;
}

export const DropdownSubMenu = ({
  subMenuOpen,
  subMenuElement,
  subMenuContent,
  parentRef,
  menuOpen,
  setMenuOpen,
  setSubMenuOpen,
}: DropdownSubMenuProps) => {
  const [dropdownMenuOpen, setDropdownMenuOpen] = useState(false);
  const [subMenuRect, setSubMenuRect] = useState<DOMRect | null>(null);
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);

  const subMenuElementRef = useRef<HTMLDivElement>(null);

  const onInteractOutsideContent = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (e: any) => {
      e.preventDefault();
      const { x, y } = (e.detail.originalEvent as PointerEvent) || {};
      if (x && y) {
        setSubMenuOpen?.(false);
        if (
          subMenuRect &&
          parentRect &&
          !isClickingMenuHeader({ x, y, subMenuRect, parentRect })
        ) {
          // without this timeout the collapse of the context menu freezes the screen
          setTimeout(() => {
            setMenuOpen?.(false);
          }, 1);
        }
      }
    },
    [parentRect, setMenuOpen, setSubMenuOpen, subMenuRect],
  );

  useEffect(() => {
    setTimeout(
      () => {
        setDropdownMenuOpen(subMenuOpen);
      },
      // eslint-disable-next-line no-nested-ternary
      subMenuOpen ? 0 : menuOpen ? 200 : 0,
    );
  }, [subMenuOpen, menuOpen]);

  useEffect(() => {
    triggerSubMenuListener({ open: subMenuOpen });
  }, [subMenuOpen]);

  useEffect(() => {
    setTimeout(() => {
      if (subMenuElementRef.current) {
        const rect = subMenuElementRef.current.getBoundingClientRect();
        setSubMenuRect(rect);
      }
      if (parentRef?.current) {
        const parentRefRect = parentRef.current.getBoundingClientRect();
        setParentRect(parentRefRect);
      }
    }, 100);
  }, [parentRef]);

  return (
    <DropdownMenu open={dropdownMenuOpen}>
      <DropdownMenuTrigger asChild>
        <Box ref={subMenuElementRef}>{subMenuElement}</Box>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        animate={false}
        key="sub-menu-element"
        border={false}
        onInteractOutside={(e: Event) => e.preventDefault()}
        sideOffset={SUBMENU_SIDE_OFFSET}
        alignOffset={SUBMENU_ALIGN_OFFSET}
      >
        {subMenuElement}
      </DropdownMenuContent>
      <AnimatePresence>
        {subMenuOpen && (
          <DropdownMenuContent
            animate
            border={false}
            key="sub-menu-content"
            sideOffset={SUBMENU_SIDE_OFFSET}
            alignOffset={SUBMENU_ALIGN_OFFSET}
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
