import clsx, { ClassValue } from 'clsx';
import React, { ReactNode, useCallback, useRef } from 'react';

import { shortcuts } from '~/core/references/shortcuts';
import { simulateClick } from '~/entries/popup/utils/simulateClick';

import { Box, BoxProps } from '../Box/Box';

import { accentFocusVisibleStyle, avatarFocusVisibleStyle } from './Lens.css';

export function Lens({
  children,
  className,
  forceAvatarColor,
  forwardNav,
  handleOpenMenu,
  onKeyDown,
  tabIndex,
  bubblesOnKeyDown = false,
  ...restProps
}: BoxProps & {
  children: ReactNode;
  className?: ClassValue & string;
  forceAvatarColor?: boolean;
  forwardNav?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  handleOpenMenu?: () => void;
  style?: React.CSSProperties;
  bubblesOnKeyDown?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key === shortcuts.global.SELECT.key ||
        (e.key === shortcuts.global.FORWARD.key && forwardNav)
      ) {
        simulateClick(containerRef?.current, { bubbles: bubblesOnKeyDown });
        onKeyDown?.(e);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === shortcuts.global.OPEN_CONTEXT_MENU.key) {
        handleOpenMenu?.();
      }
    },
    [bubblesOnKeyDown, forwardNav, handleOpenMenu, onKeyDown],
  );
  return (
    <Box
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={clsx(
        forceAvatarColor ? avatarFocusVisibleStyle : accentFocusVisibleStyle,
        className ?? undefined,
      )}
      tabIndex={typeof tabIndex === 'number' ? tabIndex : 0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {children}
    </Box>
  );
}
