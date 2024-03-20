import { assignInlineVars } from '@vanilla-extract/dynamic';
import type { CSSVarFunction, MapLeafNodes } from '@vanilla-extract/private';
import chroma from 'chroma-js';
import React, {
  CSSProperties,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from 'react';

import { useCurrentThemeStore } from '~/core/state/currentSettings/currentTheme';
import { handleAccentColor } from '~/core/utils/colors';

import { accentColorHslVars, avatarColorHslVars } from '../../styles/core.css';
import {
  BackgroundColor,
  ColorContext,
  backgroundColors,
  foregroundColors,
} from '../../styles/designTokens';
import { hslObjectForColor } from '../../styles/hslObjectForColor';
import { themeClasses } from '../../styles/theme';

export interface ColorContextValue {
  lightThemeColorContext: ColorContext;
  darkThemeColorContext: ColorContext;
}

const ColorContextContext = createContext<ColorContextValue>({
  lightThemeColorContext: 'light',
  darkThemeColorContext: 'dark',
});

export function useColorContext() {
  return useContext(ColorContextContext);
}

const AccentColorContext = createContext<ColorContext>('dark');
const AvatarColorContext = createContext<ColorContext>('dark');

export function useAccentColorContext() {
  return useContext(AccentColorContext);
}

interface ColorContextProviderProps {
  background:
    | 'accent'
    | BackgroundColor
    | {
        default: 'accent' | BackgroundColor;
        hover?: 'accent' | BackgroundColor;
        focus?: 'accent' | BackgroundColor;
        active?: 'accent' | BackgroundColor;
        hoverActive?: 'accent' | BackgroundColor;
      };
  children: ReactNode;
}

export function ColorContextProvider({
  background,
  children,
}: ColorContextProviderProps) {
  const parentContext = useColorContext();
  const accentColorContext = useAccentColorContext();

  const lightThemeBackgroundColor =
    typeof background === 'string' ? background : background.default;
  const darkThemeBackgroundColor =
    typeof background === 'string' ? background : background.default;

  const lightThemeColorContext =
    lightThemeBackgroundColor === 'accent'
      ? accentColorContext
      : backgroundColors[lightThemeBackgroundColor][
          parentContext.lightThemeColorContext
        ].setColorContext;

  const darkThemeColorContext =
    darkThemeBackgroundColor === 'accent'
      ? accentColorContext
      : backgroundColors[darkThemeBackgroundColor][
          parentContext.darkThemeColorContext
        ].setColorContext;

  const value = useMemo<ColorContextValue>(
    () => ({ lightThemeColorContext, darkThemeColorContext }),
    [lightThemeColorContext, darkThemeColorContext],
  );

  return (
    <ColorContextContext.Provider value={value}>
      {children}
    </ColorContextContext.Provider>
  );
}

interface AccentColorContextProviderProps {
  color: string;
  children:
    | ReactNode
    | ((args: { className: string; style: CSSProperties }) => ReactNode);
}

function createColorProvider(
  context: React.Context<ColorContext>,
  displayName: string,
  hslVars: MapLeafNodes<
    { hue: null; saturation: null; lightness: null },
    CSSVarFunction
  >,
) {
  const ColorProvider = function ({
    color,
    children,
  }: AccentColorContextProviderProps) {
    const { lightThemeColorContext, darkThemeColorContext } = useColorContext();

    const { value, style } = useMemo<{
      value: ColorContext;
      style: CSSProperties;
    }>(
      () => ({
        value: chroma.contrast(color, '#fff') > 2.125 ? 'dark' : 'light',
        style: assignInlineVars(hslVars, hslObjectForColor(color)),
      }),
      [color],
    );

    const className = [
      // These color context classes need to be re-applied so
      // that the themed CSS variables are re-evaluated using
      // the new accent color, e.g. if we don't do this, the
      // "accent" shadow color will always be blue, even when
      // inside an AccentColorProvider with a different color.
      themeClasses.lightTheme[`${lightThemeColorContext}Context`],
      themeClasses.darkTheme[`${darkThemeColorContext}Context`],
    ].join(' ');

    return (
      <context.Provider value={value}>
        {typeof children === 'function' ? (
          children({ className, style })
        ) : (
          <div className={className} style={style}>
            {children}
          </div>
        )}
      </context.Provider>
    );
  };
  ColorProvider.displayName = displayName;
  return ColorProvider;
}

export const AvatarColorProvider = createColorProvider(
  AvatarColorContext,
  'AvatarColorProvider',
  avatarColorHslVars,
);

const RawAccentColorProvider = createColorProvider(
  AccentColorContext,
  'AccentColorProvider',
  accentColorHslVars,
);

export const AccentColorProvider = ({
  color,
  respectColor,
  children,
}: {
  color?: string;
  respectColor?: boolean;
  children: AccentColorContextProviderProps['children'];
}) => {
  const { currentTheme } = useCurrentThemeStore();
  const defaultColor =
    currentTheme === 'light'
      ? foregroundColors.labelQuaternary.dark
      : foregroundColors.labelQuaternary.light;
  return (
    <RawAccentColorProvider
      color={
        respectColor
          ? color || defaultColor
          : handleAccentColor(currentTheme, color || defaultColor)
      }
    >
      {children}
    </RawAccentColorProvider>
  );
};

interface ThemeProviderProps {
  theme: ColorContext;
  children: ReactNode | ((args: { className: string }) => ReactNode);
}

const lightContextClasses = `${themeClasses.lightTheme.lightContext} ${themeClasses.darkTheme.lightContext}`;
const darkContextClasses = `${themeClasses.lightTheme.darkContext} ${themeClasses.darkTheme.darkContext}`;

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const className = theme === 'dark' ? darkContextClasses : lightContextClasses;

  return (
    <ColorContextContext.Provider
      value={useMemo(
        () => ({
          lightThemeColorContext: theme,
          darkThemeColorContext: theme,
        }),
        [theme],
      )}
    >
      {typeof children === 'function' ? (
        children({ className })
      ) : (
        <div className={className}>{children}</div>
      )}
    </ColorContextContext.Provider>
  );
}
