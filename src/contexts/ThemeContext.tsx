import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { ensureDeviceId, getThemePreference, setThemePreference } from '../lib/db';
import type { ThemeMode } from '../types';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;

    async function loadTheme() {
      await ensureDeviceId(db);
      const nextTheme = await getThemePreference(db);
      if (mounted) {
        setTheme(nextTheme);
      }
    }

    loadTheme().catch(() => {});

    return () => {
      mounted = false;
    };
  }, [db]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    setThemePreference(db, next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
