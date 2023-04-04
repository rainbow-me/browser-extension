import React, { ReactElement, useState } from 'react';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { Tooltip } from './Tooltip';
import useMousePosition from './useMousePosition';

export const LiveCursorTooltip = ({
  text,
  textWeight,
  textSize,
  textColor,
  children,
}: {
  children: ReactElement;
  text: string;
  align?: 'start' | 'center' | 'end';
  arrowAlignment?: 'left' | 'center' | 'right';
  textSize?: TextStyles['fontSize'];
  textWeight?: TextStyles['fontWeight'];
  textColor?: TextStyles['color'];
}) => {
  const [open, setOpen] = useState(false);
  const { x, y } = useMousePosition();
  return (
    <>
      <Tooltip
        text={text}
        textWeight={textWeight}
        textSize={textSize}
        textColor={textColor}
        open={open}
      >
        <Box
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            top: `${y}px`,
            left: `${x}px`,
          }}
        />
      </Tooltip>
      <Box
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </Box>
    </>
  );
};
