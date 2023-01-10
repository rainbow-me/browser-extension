import React from 'react';

import { TextStyles, textStyles } from '../../styles/core.css';
import { Box } from '../Box/Box';
import { Inset } from '../Inset/Inset';

interface TextOverflowProps {
  align?: TextStyles['textAlign'];
  as?: 'div' | 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: React.ReactNode;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
  testId?: string;
  maxWidth?: number;
}

export function TextOverflow({
  align,
  as = 'div',
  children,
  color = 'label',
  size,
  weight,
  testId,
  maxWidth,
}: TextOverflowProps) {
  return (
    <Box style={{ maxWidth }}>
      <Box
        marginVertical="-8px"
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
        <Inset vertical="8px">
          <Box
            as={as}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {children}
          </Box>
        </Inset>
      </Box>
    </Box>
  );
}
