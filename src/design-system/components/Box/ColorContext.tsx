import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import {
  BackgroundColor,
  backgroundColors,
  ColorContext,
} from '../../styles/designTokens';

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

interface ColorContextProviderProps {
  background:
    | BackgroundColor
    | { light: BackgroundColor; dark: BackgroundColor };
  children: ReactNode;
}

export function ColorContextProvider({
  background,
  children,
}: ColorContextProviderProps) {
  const parentContext = useColorContext();

  const lightThemeColorContext =
    backgroundColors[
      typeof background === 'string' ? background : background.light
    ][parentContext.lightThemeColorContext].setColorContext;

  const darkThemeColorContext =
    backgroundColors[
      typeof background === 'string' ? background : background.dark
    ][parentContext.darkThemeColorContext].setColorContext;

  const value = useMemo<ColorContextValue>(
    () => ({ lightThemeColorContext, darkThemeColorContext }),
    [lightThemeColorContext, darkThemeColorContext],
  );

  return (
    <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
  );
}
