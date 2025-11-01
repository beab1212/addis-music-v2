'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export const useTheme = () => {
  const { mode, setTheme, getEffectiveTheme } = useThemeStore();

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [mode, getEffectiveTheme]);

  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => {
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
      };
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [mode]);

  return { mode, setTheme, effectiveTheme: getEffectiveTheme() };
};
