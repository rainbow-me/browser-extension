import React, { forwardRef } from 'react';
import type * as Polymorphic from '@radix-ui/react-polymorphic';
import clsx, { ClassValue } from 'clsx';
import {
  boxStyles,
  BoxStyles,
  resetBase,
  resetElements,
} from '../../styles/core.css';
import { backgroundColors, BackgroundColor } from '../../styles/designTokens';
import {
  BackgroundContextProvider,
  useBackgroundContext,
} from './BackgroundContext';

type PolymorphicBox = Polymorphic.ForwardRefComponent<
  'div',
  Omit<BoxStyles, 'background'> & {
    background?:
      | BackgroundColor
      | { light: BackgroundColor; dark: BackgroundColor };
    className?: ClassValue;
  }
>;

export const Box = forwardRef(
  ({ as: Component = 'div', className, ...props }, ref) => {
    const backgroundContext = useBackgroundContext();
    const background = props.background;

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

    const el = (
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
          background
            ? [
                backgroundColors[
                  typeof background === 'string' ? background : background.light
                ][backgroundContext.lightTheme].setColorContext === 'light'
                  ? 'lightTheme-lightContext'
                  : 'lightTheme-darkContext',
                backgroundColors[
                  typeof background === 'string' ? background : background.dark
                ][backgroundContext.darkTheme].setColorContext === 'light'
                  ? 'darkTheme-lightContext'
                  : 'darkTheme-darkContext',
              ]
            : null,
          className,
        )}
        // Since Box is a primitive component, it needs to spread props
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
      />
    );

    return props.background ? (
      <BackgroundContextProvider background={props.background}>
        {el}
      </BackgroundContextProvider>
    ) : (
      el
    );
  },
) as PolymorphicBox;

Box.displayName = 'Box';
