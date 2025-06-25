
import React, { useEffect, useState } from 'react';
import { ThemeValidator } from './theme-validator';
import { LegalThemeContext, type LegalThemeConfig } from './useLegalTheme';


interface LegalThemeProviderProps {
  children: React.ReactNode;
}

/**
 * LegalThemeProvider - Provider avançado para configurações do tema LEGAL
 * Gerencia configurações de acessibilidade e performance
 */
export const LegalThemeProvider: React.FC<LegalThemeProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<LegalThemeConfig>(() => {
    // Detectar preferências do usuário
    const reducedMotion = typeof window !== 'undefined' 
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;
    
    const highContrast = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-contrast: high)').matches
      : false;

    return {
      enableAnimations: !reducedMotion,
      enableRippleEffect: !reducedMotion,
      contrastMode: highContrast ? 'high' : 'normal',
      reducedMotion
    };
  });

  const updateConfig = (newConfig: Partial<LegalThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  useEffect(() => {
    // Aplicar configurações ao DOM
    const root = document.documentElement;
    
    // Aplicar classes baseadas na configuração
    if (config.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    if (config.contrastMode === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Configurar variáveis CSS customizadas
    root.style.setProperty('--legal-animations-enabled', config.enableAnimations ? '1' : '0');
    root.style.setProperty('--legal-ripple-enabled', config.enableRippleEffect ? '1' : '0');
    
    console.log('🎨 LEGAL Theme Config aplicada:', config);
  }, [config]);

  // Listener para mudanças de preferências do sistema
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateConfig({ 
        reducedMotion: e.matches,
        enableAnimations: !e.matches,
        enableRippleEffect: !e.matches
      });
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateConfig({ contrastMode: e.matches ? 'high' : 'normal' });
    };
    
    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);
    
    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return (
    <LegalThemeContext.Provider value={{ config, updateConfig }}>
      <ThemeValidator>
        {children}
      </ThemeValidator>
    </LegalThemeContext.Provider>
  );
};

