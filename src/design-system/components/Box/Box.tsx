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
import { themeClasses } from '../../styles/theme';
import {
  ColorContextProvider,
  useAccentColorContext,
  useColorContext,
} from './ColorContext';

type PolymorphicBox = Polymorphic.ForwardRefComponent<
  'div',
  Omit<BoxStyles, 'background'> & {
    background?:
      | 'accent'
      | BackgroundColor
      | { light: 'accent' | BackgroundColor; dark: 'accent' | BackgroundColor };
    className?: ClassValue;
    testId?: string;
  }
>;

export const Box = forwardRef(
  ({ as: Component = 'div', className, testId, ...props }, ref) => {
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

    const { lightThemeColorContext, darkThemeColorContext } = useColorContext();
    const accentColorContext = useAccentColorContext();
    const background = props.background;

    const lightThemeBackgroundColor =
      typeof background === 'string' ? background : background?.light ?? null;
    const darkThemeBackgroundColor =
      typeof background === 'string' ? background : background?.dark ?? null;

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
          lightThemeBackgroundColor && darkThemeBackgroundColor
            ? [
                (lightThemeBackgroundColor === 'accent'
                  ? accentColorContext
                  : backgroundColors[lightThemeBackgroundColor][
                      lightThemeColorContext
                    ].setColorContext) === 'light'
                  ? themeClasses.lightTheme.lightContext
                  : themeClasses.lightTheme.darkContext,

                (darkThemeBackgroundColor === 'accent'
                  ? accentColorContext
                  : backgroundColors[darkThemeBackgroundColor][
                      darkThemeColorContext
                    ].setColorContext) === 'light'
                  ? themeClasses.darkTheme.lightContext
                  : themeClasses.darkTheme.darkContext,
              ]
            : null,
          className,
        )}
        data-testid={testId}
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
