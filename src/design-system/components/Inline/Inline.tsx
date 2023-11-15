import { ReactNode, forwardRef } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';

import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

const alignHorizontalToJustifyContent = {
  center: 'center',
  justify: 'space-between',
  left: 'flex-start',
  right: 'flex-end',
} as const;
export type AlignHorizontal = keyof typeof alignHorizontalToJustifyContent;

const alignVerticalToAlignItems = {
  bottom: 'flex-end',
  center: 'center',
  top: 'flex-start',
} as const;
type AlignVertical = keyof typeof alignVerticalToAlignItems;

interface InlineProps {
  space?: Space;
  alignHorizontal?: AlignHorizontal;
  alignVertical?: AlignVertical;
  height?: BoxStyles['height'];
  wrap?: boolean;
  children?: ReactNode;
}

export const Inline = forwardRef<HTMLDivElement, InlineProps>(function Inline(
  {
    children,
    alignHorizontal = 'left',
    alignVertical,
    height,
    wrap = true,
    space,
  },
  ref,
) {
  return (
    <Box
      ref={ref}
      display="flex"
      flexDirection="row"
      height={height}
      alignItems={alignVertical && alignVerticalToAlignItems[alignVertical]}
      justifyContent={alignHorizontalToJustifyContent[alignHorizontal]}
      flexWrap={wrap ? 'wrap' : undefined}
      gap={space}
    >
      {children}
    </Box>
  );
});
