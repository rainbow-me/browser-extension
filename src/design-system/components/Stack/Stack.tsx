import { Children, ReactNode } from 'react';

import { BoxStyles } from '~/design-system/styles/core.css';

import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

const alignHorizontalToAlignItems = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
  stretch: 'stretch',
} as const;
type AlignHorizontal = keyof typeof alignHorizontalToAlignItems;

interface StackProps {
  space?: Space;
  alignHorizontal?: AlignHorizontal;
  justify?: BoxStyles['justifyContent'];
  children?: ReactNode;
  separator?: ReactNode;
}

export function Stack({
  children,
  alignHorizontal,
  justify,
  space,
  separator = null,
}: StackProps) {
  const childrenArray = Children.toArray(children);
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={
        alignHorizontal && alignHorizontalToAlignItems[alignHorizontal]
      }
      justifyContent={justify}
      gap={space}
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
