// mobile/src/contexts/ThemeContext.tsx
import React, { createContext, useState, ReactNode } from 'react';
import { DARK_COLORS, LIGHT_COLORS } from '../theme';

interface ThemeContextData {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof DARK_COLORS;
}

export const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};