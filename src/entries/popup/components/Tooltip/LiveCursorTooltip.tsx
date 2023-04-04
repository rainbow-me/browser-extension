import React, { ReactElement, useState } from 'react';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { Cursor } from './Cursor';
import { Tooltip } from './Tooltip';

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
  return (
    <>
      <Tooltip
        text={text}
        textWeight={textWeight}
        textSize={textSize}
        textColor={textColor}
        open={open}
      >
        <Cursor />
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
