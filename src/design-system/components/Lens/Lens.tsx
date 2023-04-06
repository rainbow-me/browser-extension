import React, { ReactNode, useCallback, useRef } from 'react';

import { shortcuts } from '~/core/references/shortcuts';

import { Box, BoxProps } from '../Box/Box';

import { focusVisibleStyle } from './Lens.css';

function simulatePointerEvent(ref: React.RefObject<HTMLDivElement>) {
  if (ref?.current) {
    const el = ref?.current;
    const box = el.getBoundingClientRect();
    const e = new MouseEvent('pointerdown', {
      bubbles: true,
      clientX: box.left + (box.right - box.left) / 2,
      clientY: box.top + (box.bottom - box.top) / 2,
      view: window,
    });
    el.dispatchEvent(e);
  }
}

export function Lens({
  children,
  forceClick,
  tabIndex,
  ...restProps
}: BoxProps & { children: ReactNode; forceClick?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === shortcuts.global.SELECT.key) {
        if (forceClick) {
          simulatePointerEvent(containerRef);
        }
      }
    },
    [forceClick],
  );
  return (
    <Box
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      className={focusVisibleStyle}
      tabIndex={typeof tabIndex === 'number' ? tabIndex : 0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      {children}
    </Box>
  );
}
