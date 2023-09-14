import React, { ReactNode, useState } from 'react';

import { Box } from '~/design-system';
import { TextStyles } from '~/design-system/styles/core.css';

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
  const [open, setOpen] = useState(false);

  if (process.env.IS_TESTING === 'true') {
    return <Box>{children}</Box>;
  }

  return (
    <>
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
      <Box
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </Box>
    </>
  );
};
