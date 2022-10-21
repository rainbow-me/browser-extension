import React, {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import chroma from 'chroma-js';
import { accentColorHslVars, boxStyles } from '../../styles/core.css';
import {
  BackgroundColor,
  backgroundColors,
  ColorContext,
} from '../../styles/designTokens';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import { hslObjectForColor } from '../../styles/hslObjectForColor';
import { themeClasses } from '../../styles/themeClasses';

export interface ColorContextValue {
  lightThemeColorContext: ColorContext;
  darkThemeColorContext: ColorContext;
}

const ColorContext = createContext<ColorContextValue>({
  lightThemeColorContext: 'light',
  darkThemeColorContext: 'dark',
});

export function useColorContext() {
  return useContext(ColorContext);
}

const AccentColorContext = createContext<ColorContext>('dark');

export function useAccentColorContext() {
  return useContext(AccentColorContext);
}

interface ColorContextProviderProps {
  background:
    | 'accent'
    | BackgroundColor
    | { light: 'accent' | BackgroundColor; dark: 'accent' | BackgroundColor };
  children: ReactNode;
}

export function ColorContextProvider({
  background,
  children,
}: ColorContextProviderProps) {
  const parentContext = useColorContext();
  const accentColorContext = useAccentColorContext();

  const lightThemeBackgroundColor =
    typeof background === 'string' ? background : background.light;
  const darkThemeBackgroundColor =
    typeof background === 'string' ? background : background.dark;

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
    <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
  );
}

interface AccentColorContextProviderProps {
  color: string;
  children:
    | ReactNode
    | ((args: { style: CSSProperties; className: string }) => ReactNode);
}

export function AccentColorProvider({
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
      style: assignInlineVars(accentColorHslVars, hslObjectForColor(color)),
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
    boxStyles({ width: 'full' }),
  ].join(' ');

  return (
    <AccentColorContext.Provider value={value}>
      {typeof children === 'function' ? (
        children({ style, className })
      ) : (
        <div style={style} className={className}>
          {children}
        </div>
      )}
    </AccentColorContext.Provider>
  );
}

interface ThemeProviderProps {
  theme: ColorContext;
  children: ReactNode | ((args: { className: string }) => ReactNode);
}

const lightContextClasses = `${themeClasses.lightTheme.lightContext} ${themeClasses.darkTheme.lightContext}`;
const darkContextClasses = `${themeClasses.lightTheme.darkContext} ${themeClasses.darkTheme.darkContext}`;

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const className = theme === 'dark' ? darkContextClasses : lightContextClasses;

  return (
    <ColorContext.Provider
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
    </ColorContext.Provider>
  );
}
