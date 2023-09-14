import { ReactNode, forwardRef } from 'react';

import { Space, spaceToNegativeSpace } from '../../styles/designTokens';
import { Box } from '../Box/Box';

interface BleedProps {
  space?: Space;
  horizontal?: Space;
  vertical?: Space;
  top?: Space;
  bottom?: Space;
  left?: Space;
  right?: Space;
  children?: ReactNode;
}

export const Bleed = forwardRef<HTMLDivElement, BleedProps>(function Bleed(
  { children, space, horizontal, vertical, top, bottom, right, left, ...props },
  ref,
) {
  const topSpace = top ?? vertical ?? space;
  const bottomSpace = bottom ?? vertical ?? space;
  const leftSpace = left ?? horizontal ?? space;
  const rightSpace = right ?? horizontal ?? space;

  return (
    <Box
      ref={ref}
      marginTop={topSpace && spaceToNegativeSpace[topSpace]}
      marginBottom={bottomSpace && spaceToNegativeSpace[bottomSpace]}
      marginLeft={leftSpace && spaceToNegativeSpace[leftSpace]}
      marginRight={rightSpace && spaceToNegativeSpace[rightSpace]}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
    </Box>
  );
});
