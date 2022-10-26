import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { Box } from '../../components/Box/Box';
import { boxStyles, TextStyles, textStyles } from '../../styles/core.css';

export const TextInline = ({
  children,
  color,
  highlight,
  weight,
}: {
  children: ReactNode;
  color?: TextStyles['color'];
  highlight: boolean;
  weight?: TextStyles['fontWeight'];
}) => (
  <Box
    as="span"
    className={clsx([
      textStyles({ color, fontWeight: weight }),
      highlight &&
        boxStyles({
          background: 'fillSecondary',
          borderRadius: '6px',
          paddingHorizontal: '4px',
        }),
    ])}
  >
    {children}
  </Box>
);
