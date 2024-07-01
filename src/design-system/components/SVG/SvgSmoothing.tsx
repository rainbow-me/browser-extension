import * as React from 'react';

import { Box } from '../Box/Box';

export interface SvgSmoothingProps {
  boxed?: boolean;
  children: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  disableSmoothing?: boolean;
  size: number;
}

export const SvgSmoothing = ({
  boxed = true,
  children,
  disableSmoothing = false,
  size,
}: SvgSmoothingProps) => {
  const svgWithStyles = React.cloneElement(children, {
    style: {
      ...children.props.style,
      height: disableSmoothing ? size : size * 2,
      width: disableSmoothing ? size : size * 2,
    },
  });

  return (
    <Box
      style={{
        ...(boxed
          ? {
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'center',
            }
          : { height: size, width: size }),
      }}
    >
      <Box
        style={{
          ...(boxed
            ? {
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                transform: disableSmoothing ? 'none' : 'scale(0.5)',
                willChange: 'transform',
              }
            : {
                transform: disableSmoothing ? 'none' : 'scale(0.5)',
                transformOrigin: 'top left',
                willChange: 'transform',
              }),
        }}
      >
        {svgWithStyles}
      </Box>
    </Box>
  );
};
