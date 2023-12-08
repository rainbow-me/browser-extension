import { Children, ReactNode } from 'react';

import { Space } from '../../styles/designTokens';
import { Box, BoxProps } from '../Box/Box';

const alignHorizontalToAlignItems = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
  stretch: 'stretch',
} as const;
type AlignHorizontal = keyof typeof alignHorizontalToAlignItems;

export interface StackProps extends BoxProps {
  space?: Space;
  alignHorizontal?: AlignHorizontal;
  children?: ReactNode;
  separator?: ReactNode;
}

export function Stack({
  children,
  alignHorizontal,
  space,
  separator = null,
  ...props
}: StackProps) {
  const childrenArray = Children.toArray(children);
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={
        alignHorizontal && alignHorizontalToAlignItems[alignHorizontal]
      }
      gap={space}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {Children.map(childrenArray, (child, index) => {
        const isLastChild = index === childrenArray.length - 1;

        return (
          <>
            {child}
            {separator && !isLastChild ? separator : null}
          </>
        );
      })}
    </Box>
  );
}
