
import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, event?: React.MouseEvent<HTMLButtonElement>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('legal-theme');
      return (savedTheme as Theme) || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light'; // Fallback para SSR ou quando window não está disponível
  });

  const handleThemeChange = (newTheme: Theme, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (typeof window !== 'undefined') {
      // Salvamos o tema antes de iniciar a animação
      setTheme(newTheme);
      localStorage.setItem('legal-theme', newTheme);
      
      // Log para debugging
      console.log(`🎨 LEGAL Theme changed to: ${newTheme}`);
      
      // Se temos um evento (clique no botão), criamos um efeito de onda
      if (event) {
        createRippleEffect(event, newTheme);
      }
    }
  };

  const createRippleEffect = (event: React.MouseEvent<HTMLButtonElement>, newTheme: Theme) => {
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    
    // Posição central do botão
    const x = buttonRect.left + buttonRect.width / 2;
    const y = buttonRect.top + buttonRect.height / 2;
    
    // Calculamos o tamanho máximo necessário para cobrir toda a tela
    const size = Math.max(window.innerWidth, window.innerHeight) * 2.5;
    
    // Criamos o elemento de animação
    const ripple = document.createElement('div');
    ripple.className = `theme-ripple theme-ripple-${newTheme}`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    
    document.body.appendChild(ripple);
    
    // Iniciamos a animação
    ripple.style.animation = `ripple 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
    
    // Removemos o elemento após a animação
    setTimeout(() => {
      if (document.body.contains(ripple)) {
        document.body.removeChild(ripple);
      }
    }, 1000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      // Adiciona a classe para a animação antes de mudar o tema
      root.classList.add('theme-transition');
      
      // Remove as classes de tema
      root.classList.remove('light', 'dark');
      
      // Adiciona a nova classe de tema
      root.classList.add(theme);
      
      // Adiciona meta tag para status bar no mobile
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#121212' : '#ffffff');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = theme === 'dark' ? '#121212' : '#ffffff';
        document.head.appendChild(meta);
      }
      
      // Remove a classe de animação após a transição
      const timeoutId = setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme]);

  // Adiciona listener para mudanças de preferência do sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        // Só muda automaticamente se não há preferência salva
        const savedTheme = localStorage.getItem('legal-theme');
        if (!savedTheme) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      };
      
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook utilitário para verificar se está em modo escuro
export const useIsDarkMode = () => {
  const { theme } = useTheme();
  return theme === 'dark';
};
