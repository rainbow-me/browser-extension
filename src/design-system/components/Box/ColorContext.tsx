import React, {
  createContext,
  CSSProperties,
  ReactNode,
  useContext,
  useMemo,
} from 'react';
import chroma from 'chroma-js';
import { accentColorVar } from '../../styles/core.css';
import {
  BackgroundColor,
  backgroundColors,
  ColorContext,
} from '../../styles/designTokens';
import { assignInlineVars } from '@vanilla-extract/dynamic';
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
  children: ReactNode | ((args: { style: CSSProperties }) => ReactNode);
}

export function AccentColorProvider({
  color,
  children,
}: AccentColorContextProviderProps) {
  const { value, style } = useMemo<{
    value: ColorContext;
    style: CSSProperties;
  }>(
    () => ({
      value: chroma.contrast(color, '#fff') > 2.125 ? 'dark' : 'light',
      style: assignInlineVars({ color: accentColorVar }, { color }),
    }),
    [color],
  );

  return (
    <AccentColorContext.Provider value={value}>
      {typeof children === 'function' ? (
        children({ style })
      ) : (
        <div style={style}>{children}</div>
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
