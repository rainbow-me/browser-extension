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
  background?: TextStyles['background'];
  webkitBackgroundClip?: TextStyles['WebkitBackgroundClip'];
}

export function Text({
  align,
  as = 'div',
  background,
  children,
  color = 'label',
  size,
  weight,
  testId,
  webkitBackgroundClip,
}: TextProps) {
  return (
    <Box
      as={as}
      className={textStyles({
        color,
        cursor: 'default',
        fontFamily: 'rounded',
        fontSize: size,
        fontWeight: weight,
        textAlign: align,
        background,
        WebkitBackgroundClip: webkitBackgroundClip,
      })}
      testId={testId}
      marginVertical={webkitBackgroundClip === 'text' ? '-6px' : undefined}
      paddingVertical={webkitBackgroundClip === 'text' ? '6px' : undefined}
    >
      {children}
    </Box>
  );
}
