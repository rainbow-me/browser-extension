import React from 'react';
import { Box } from '../Box/Box';
import { textStyles, TextStyles } from '../../styles/core.css';

interface TextProps {
  align?: TextStyles['textAlign'];
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
}

export function Text({
  align,
  as = 'div',
  children,
  color = 'label',
  size,
  weight,
}: TextProps) {
  return (
    <Box
      as={as}
      className={textStyles({
        color,
        fontFamily: 'rounded',
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
      })}
    >
      {children}
    </Box>
  );
}
