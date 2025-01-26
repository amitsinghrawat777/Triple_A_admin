import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode');
    return (saved as ThemeMode) || 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (themeMode === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Set initial dark mode based on theme mode and system preference
    if (themeMode === 'system') {
      setIsDarkMode(systemDarkMode.matches);
    } else {
      setIsDarkMode(themeMode === 'dark');
    }

    // Listen for system theme changes
    systemDarkMode.addEventListener('change', handleSystemThemeChange);

    return () => {
      systemDarkMode.removeEventListener('change', handleSystemThemeChange);
    };
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode, isDarkMode]);

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    if (mode === 'system') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      setIsDarkMode(mode === 'dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ themeMode, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 