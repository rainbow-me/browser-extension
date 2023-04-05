import React, { ReactElement, useState } from 'react';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

import { Tooltip } from './Tooltip';

export const CursorTooltip = ({
  marginTop,
  marginLeft,
  text,
  textWeight,
  textSize,
  textColor,
  children,
}: {
  children: ReactElement;
  marginTop?: string;
  marginLeft?: string;
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
      <Box
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </Box>
    </>
  );
};
