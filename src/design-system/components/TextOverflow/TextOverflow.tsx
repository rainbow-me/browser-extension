import React, { CSSProperties } from 'react';

import { TextStyles, textStyles } from '../../styles/core.css';
import { Box } from '../Box/Box';
import { Inset } from '../Inset/Inset';

interface TextOverflowProps {
  align?: TextStyles['textAlign'];
  as?:
    | 'div'
    | 'p'
    | 'span'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'pre'
    | 'label';
  children: React.ReactNode;
  color?: TextStyles['color'];
  size: TextStyles['fontSize'];
  weight: TextStyles['fontWeight'];
  testId?: string;
  cursor?: TextStyles['cursor'];
  userSelect?: TextStyles['userSelect'];
  maxWidth?: CSSProperties['maxWidth'];
  textShadow?: TextStyles['textShadow'];
}

export function TextOverflow({
  align,
  as = 'div',
  children,
  color = 'label',
  size,
  weight,
  testId,
  cursor = 'default',
  userSelect = 'none',
  maxWidth = '',
  textShadow,
}: TextOverflowProps) {
  return (
    <Box style={{ display: 'grid', maxWidth }}>
      <Box
        marginVertical="-8px"
        className={textStyles({
          color,
          cursor,
          fontFamily: 'rounded',
          fontSize: size,
          fontWeight: weight,
          textAlign: align,
          userSelect,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textShadow,
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
