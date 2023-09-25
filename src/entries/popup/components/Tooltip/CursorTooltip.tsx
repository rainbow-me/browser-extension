import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { useBrowser } from '../../hooks/useBrowser';
import useComponentWillUnmount from '../../hooks/useComponentWillUnmount';

import { Tooltip } from './Tooltip';

export const CursorTooltip = ({
  align,
  arrowAlignment,
  arrowDirection,
  arrowCentered,
  text,
  textWeight,
  textSize,
  textColor,
  children,
  hint,
}: {
  children: ReactNode;
  text: string;
  align?: 'start' | 'center' | 'end';
  arrowAlignment?: 'left' | 'center' | 'right';
  arrowDirection?: 'down' | 'up';
  arrowCentered?: boolean;
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
  hint?: string;
}) => {
  const { isFirefox } = useBrowser();
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const showTimer = useRef<NodeJS.Timeout>();
  const childElementWrapperRef = useRef<HTMLDivElement>(null);
  const [childWidth, setChildWidth] = useState(0);
  const checkChildWidth = () => {
    const width = childElementWrapperRef.current?.offsetWidth;
    if (width) {
      setChildWidth(width);
    }
  };
  const alignOffset = useMemo(() => {
    if (!childWidth || !align || !arrowCentered) return 0;
    if (align !== 'center') {
      return childWidth / 2 - 12;
    }
    return 0;
  }, [align, arrowCentered, childWidth]);

  useEffect(() => {
    if (!isHovering) {
      clearTimeout(showTimer.current);
    }
  }, [isHovering]);

  useComponentWillUnmount(() => {
    clearTimeout(showTimer.current);
  });

  useLayoutEffect(() => {
    checkChildWidth();
  }, []);

  if (process.env.IS_TESTING === 'true' && isFirefox) {
    return <Box>{children}</Box>;
  }

  return (
    <>
      <Tooltip
        align={align}
        alignOffset={alignOffset}
        arrowAlignment={arrowAlignment}
        arrowDirection={arrowDirection}
        text={text}
        textWeight={textWeight}
        textSize={textSize}
        textColor={textColor}
        open={open}
        hint={hint}
      >
        <Box
          ref={childElementWrapperRef}
          onMouseEnter={() => {
            setIsHovering(true);
            showTimer.current = setTimeout(() => setOpen(true), 750);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
            setOpen(false);
          }}
        >
          {children}
        </Box>
      </Tooltip>
    </>
  );
};
