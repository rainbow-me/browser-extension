import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
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
  marginTop,
  marginLeft,
  text,
  textWeight,
  textSize,
  textColor,
  children,
  hint,
}: {
  children: ReactNode;
  marginTop?: string;
  marginLeft?: string;
  text: string;
  align?: 'start' | 'center' | 'end';
  arrowAlignment?: 'left' | 'center' | 'right';
  arrowDirection?: 'down' | 'up';
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
  hint?: string;
}) => {
  const { isFirefox } = useBrowser();
  const [open, setOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const showTimer = useRef<NodeJS.Timeout>();
  const [coords, setCoords] = useState({
    x: 0,
    y: 0,
  });
  const childElementWrapperRef = useRef<HTMLDivElement>(null);
  const setCoordinates = () => {
    const { x = 0, y = 0 } =
      childElementWrapperRef.current?.getBoundingClientRect() || {};
    setCoords({ x, y });
  };

  useEffect(() => {
    if (!isHovering) {
      clearTimeout(showTimer.current);
    }
  }, [isHovering]);

  useLayoutEffect(() => {
    setCoordinates();
  }, []);

  useComponentWillUnmount(() => {
    clearTimeout(showTimer.current);
  });

  if (process.env.IS_TESTING === 'true' && isFirefox) {
    return <Box>{children}</Box>;
  }

  return (
    <>
      <Box
        style={{
          position: 'fixed',
          top: coords.y,
          left: coords.x,
        }}
      >
        <Tooltip
          align={align}
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
            background="green"
            style={{
              position: 'fixed',
              pointerEvents: 'none',
              marginTop: marginTop,
              marginLeft: marginLeft,
            }}
          />
        </Tooltip>
      </Box>
      <Box
        ref={childElementWrapperRef}
        onMouseEnter={() => {
          setCoordinates();
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
    </>
  );
};
