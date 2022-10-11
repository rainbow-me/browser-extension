import React, { createContext, ReactNode, useContext } from 'react';
import {
  BackgroundColor,
  backgroundColors,
  ColorContext,
} from '../../styles/designTokens';

export interface BackgroundContextValue {
  lightTheme: ColorContext;
  darkTheme: ColorContext;
}

const BackgroundContext = createContext<BackgroundContextValue>({
  lightTheme: 'light',
  darkTheme: 'dark',
});

export function useBackgroundContext() {
  return useContext(BackgroundContext);
}

interface BackgroundContextProviderProps {
  background:
    | BackgroundColor
    | { light: BackgroundColor; dark: BackgroundColor };
  children: ReactNode;
}

export function BackgroundContextProvider({
  background,
  children,
}: BackgroundContextProviderProps) {
  const backgroundContext = useBackgroundContext();

  const value = {
    lightTheme:
      backgroundColors[
        typeof background === 'string' ? background : background.light
      ][backgroundContext.lightTheme].setColorContext,
    darkTheme:
      backgroundColors[
        typeof background === 'string' ? background : background.dark
      ][backgroundContext.darkTheme].setColorContext,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}
