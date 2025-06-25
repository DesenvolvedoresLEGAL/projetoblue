import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useIsDarkMode = () => {
  const { theme } = useTheme();
  return theme === 'dark';
};

export const useAccessibilityPreferences = () => {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updatePreferences = () => {
        setPreferences({
          reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
          highContrast: window.matchMedia('(prefers-contrast: high)').matches,
          darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        });
      };

      updatePreferences();

      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

      motionQuery.addEventListener('change', updatePreferences);
      contrastQuery.addEventListener('change', updatePreferences);
      darkQuery.addEventListener('change', updatePreferences);

      return () => {
        motionQuery.removeEventListener('change', updatePreferences);
        contrastQuery.removeEventListener('change', updatePreferences);
        darkQuery.removeEventListener('change', updatePreferences);
      };
    }
  }, []);

  return preferences;
};
