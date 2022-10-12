import React, { forwardRef } from 'react';
import type * as Polymorphic from '@radix-ui/react-polymorphic';
import clsx, { ClassValue } from 'clsx';
import {
  boxStyles,
  BoxStyles,
  resetBase,
  resetElements,
} from '../../styles/core.css';

type PolymorphicBox = Polymorphic.ForwardRefComponent<
  'div',
  BoxStyles & { className?: ClassValue }
>;

export const Box = forwardRef(
  ({ as: Component = 'div', className, ...props }, ref) => {
    const boxStyleOptions: BoxStyles = {};
    const restProps: Record<string, unknown> = {};

    for (const key in props) {
      if (boxStyles.properties.has(key as keyof BoxStyles)) {
        boxStyleOptions[key as keyof BoxStyles] =
          props[key as keyof typeof props];
      } else {
        restProps[key] = props[key as keyof typeof props];
      }
    }

    return (
      <Component
        ref={ref}
        className={clsx(
          typeof Component === 'string'
            ? `${resetBase}${
                Component in resetElements
                  ? ` ${resetElements[Component as keyof typeof resetElements]}`
                  : ''
              }`
            : null,
          boxStyles(boxStyleOptions),
          className,
        )}
        // Since Box is a primitive component, it needs to spread props
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
      />
    );
  },
) as PolymorphicBox;

Box.displayName = 'Box';
