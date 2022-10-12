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
import { ColorContextProvider, useColorContext } from './ColorContext';

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
    const { lightThemeColorContext, darkThemeColorContext } = useColorContext();
    const background = props.background;

    let hasBoxStyles = false;
    const boxStyleOptions: BoxStyles = {};
    const restProps: Record<string, unknown> = {};

    for (const key in props) {
      if (boxStyles.properties.has(key as keyof BoxStyles)) {
        hasBoxStyles = true;
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
          hasBoxStyles ? boxStyles(boxStyleOptions) : null,

          // Look up whether the chosen background color is light or dark and
          // apply the correct color context classes so descendent elements use
          // the appropriate light or dark theme values. We need to look up the
          // color context from React context because the parent background color
          // may be light even though the user is in dark mode and vice versa.
          background
            ? [
                backgroundColors[
                  typeof background === 'string' ? background : background.light
                ][lightThemeColorContext].setColorContext === 'light'
                  ? 'lightTheme-lightContext'
                  : 'lightTheme-darkContext',
                backgroundColors[
                  typeof background === 'string' ? background : background.dark
                ][darkThemeColorContext].setColorContext === 'light'
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
      <ColorContextProvider background={props.background}>
        {el}
      </ColorContextProvider>
    ) : (
      el
    );
  },
) as PolymorphicBox;

Box.displayName = 'Box';
