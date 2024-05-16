import clsx from 'clsx';
import React, { HTMLAttributes } from 'react';

import { TextStyles, textStyles } from '../../styles/core.css';
import { Box } from '../Box/Box';

import { selectionStyle } from './Text.css';

export interface TextProps {
  align?: TextStyles['textAlign'];
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'pre';
  children: React.ReactNode;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
  testId?: string;
  background?: TextStyles['background'];
  webkitBackgroundClip?: TextStyles['WebkitBackgroundClip'];
  cursor?: TextStyles['cursor'];
  userSelect?: TextStyles['userSelect'];
  whiteSpace?: TextStyles['whiteSpace'];
  textShadow?: TextStyles['textShadow'];
  fontFamily?: TextStyles['fontFamily'];
  translate?: HTMLAttributes<unknown>['translate'];
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
  cursor = 'default',
  userSelect = 'none',
  whiteSpace,
  textShadow,
  fontFamily = 'rounded',
  translate,
}: TextProps) {
  return (
    <Box
      as={as}
      className={clsx([
        textStyles({
          color,
          cursor,
          fontFamily,
          fontSize: size,
          fontWeight: weight,
          textAlign: align,
          background,
          userSelect,
          WebkitBackgroundClip: webkitBackgroundClip,
          transition: 'color 200ms ease-out, text-shadow 1s ease',
          whiteSpace,
          textShadow,
        }),
        selectionStyle,
      ])}
      testId={testId}
      marginVertical={webkitBackgroundClip === 'text' ? '-6px' : undefined}
      paddingVertical={webkitBackgroundClip === 'text' ? '6px' : undefined}
      translate={translate}
    >
      {children}
    </Box>
  );
}
