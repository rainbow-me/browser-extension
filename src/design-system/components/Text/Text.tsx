import React from 'react';

import { TextStyles, textStyles } from '../../styles/core.css';
import { Box } from '../Box/Box';

interface TextProps {
  align?: TextStyles['textAlign'];
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
  testId?: string;
  whiteSpace?:
    | 'normal'
    | 'nowrap'
    | 'pre'
    | 'pre-wrap'
    | 'pre-line'
    | 'break-spaces';
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  textOverflow?: 'clip' | 'ellipsis';
}

export function Text({
  align,
  as = 'div',
  children,
  color = 'label',
  size,
  weight,
  testId,
  whiteSpace,
  overflow,
  textOverflow,
}: TextProps) {
  return (
    <Box
      as={as}
      style={{ whiteSpace, overflow, textOverflow }}
      className={textStyles({
        color,
        cursor: 'default',
        fontFamily: 'rounded',
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
      })}
      testId={testId}
    >
      {children}
    </Box>
  );
}
