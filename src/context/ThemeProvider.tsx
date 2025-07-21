
import React, { useEffect, useState } from 'react';
import { Theme, ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('legal-theme');
      return (savedTheme as Theme) || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  const handleThemeChange = (newTheme: Theme, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof window !== 'undefined') {
      setTheme(newTheme);
      localStorage.setItem('legal-theme', newTheme);
      
      
      
      // QA: Verificar se animações estão habilitadas antes de criar ripple
      const animationsEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (event && animationsEnabled) {
        createRippleEffect(event, newTheme);
      }
    }
  };

  const createRippleEffect = (event: React.MouseEvent<HTMLButtonElement>, newTheme: Theme) => {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;
    
    const size = Math.max(window.innerWidth, window.innerHeight) * 2.5;
    
    const ripple = document.createElement('div');
    ripple.className = `theme-ripple theme-ripple-${newTheme}`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    
    // QA: Adicionar atributos de acessibilidade
    ripple.setAttribute('aria-hidden', 'true');
    ripple.setAttribute('role', 'presentation');
    
    document.body.appendChild(ripple);
    
    ripple.style.animation = `ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    
    setTimeout(() => {
      if (document.body.contains(ripple)) {
        document.body.removeChild(ripple);
      }
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      // QA: Melhor transição com classes preparatórias
      root.classList.add('theme-transition');
      
      // QA: Usar requestAnimationFrame para melhor performance
      requestAnimationFrame(() => {
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        
        // QA: Meta tag otimizada para PWA
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        const themeColor = theme === 'dark' ? '#121212' : '#ffffff';
        
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', themeColor);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'theme-color';
          meta.content = themeColor;
          document.head.appendChild(meta);
        }
      });
      
      const timeoutId = setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme]);

  // QA: Listeners aprimorados para preferências do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        const savedTheme = localStorage.getItem('legal-theme');
        if (!savedTheme) {
          const newTheme = e.matches ? 'dark' : 'light';
          setTheme(newTheme);
          
        }
      };
      
      // QA: Usar addEventListener para melhor compatibilidade
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleThemeChange }}>
      {children}
    </ThemeContext.Provider>
  );
};

