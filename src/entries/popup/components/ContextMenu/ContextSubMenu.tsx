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
  ContextMenu,
  ContextMenuContent,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ContextMenu/ContextMenu';
import {
  subMenuListener,
  triggerSubMenuListener,
} from '../DropdownMenu/DropdownSubMenu';

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

export const ContextMenuContentWithSubMenu = ({
  children,
  sideOffset,
  subMenuRef,
  onInteractOutside,
}: {
  children: ReactElement;
  sideOffset?: number;
  subMenuRef: React.MutableRefObject<HTMLDivElement | null>;
  onInteractOutside?: () => void;
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
      <ContextMenuContent
        scale={subMenuOpen ? 0.94 : 1}
        sideOffset={sideOffset}
        onInteractOutside={onInteractOutside}
      >
        {children}
      </ContextMenuContent>
    </Box>
  );
};

interface DropdownSubMenuProps {
  setMenuOpen: (open: boolean) => void;
  subMenuOpen: boolean;
  subMenuElement: ReactNode;
  subMenuContent: ReactNode;
  parentRef?: React.MutableRefObject<HTMLDivElement | null>;
  setSubMenuOpen?: (open: boolean) => void;
}

export const ContextSubMenu = ({
  subMenuOpen,
  subMenuElement,
  subMenuContent,
  parentRef,
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
        setDropdownMenuOpen(false);
        setSubMenuOpen?.(false);
        if (
          subMenuRect &&
          parentRect &&
          !isClickingMenuHeader({ x, y, subMenuRect, parentRect })
        ) {
          setMenuOpen?.(false);
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
      subMenuOpen ? 0 : 500,
    );
  }, [subMenuOpen]);

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
    <ContextMenu open={dropdownMenuOpen}>
      <ContextMenuTrigger asChild>
        <Box ref={subMenuElementRef}>{subMenuElement}</Box>
      </ContextMenuTrigger>
      <ContextMenuContent
        animate={false}
        key="sub-menu-element"
        border={false}
        onInteractOutside={(e: Event) => e.preventDefault()}
        sideOffset={-44}
        alignOffset={-12}
      >
        {subMenuElement}
      </ContextMenuContent>
      <AnimatePresence>
        {subMenuOpen && (
          <ContextMenuContent
            animate
            border={false}
            key="sub-menu-content"
            sideOffset={-44}
            alignOffset={-12}
            onInteractOutside={onInteractOutsideContent}
          >
            <Stack space="4px">
              {subMenuElement}
              <ContextMenuSeparator />
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
          </ContextMenuContent>
        )}
      </AnimatePresence>
    </ContextMenu>
  );
};
