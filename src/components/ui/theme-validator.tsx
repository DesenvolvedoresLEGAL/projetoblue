
import React, { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAccessibilityValidator } from './useAccessibilityValidator';

interface ThemeValidatorProps {
  children: React.ReactNode;
}

/**
 * ThemeValidator - Componente para validação e QA do tema LEGAL
 * Verifica se todas as variáveis CSS estão definidas corretamente
 */
export const ThemeValidator: React.FC<ThemeValidatorProps> = ({ children }) => {
  const { theme } = useTheme();

  useEffect(() => {
    // Validação das variáveis CSS do tema LEGAL
    const validateThemeVariables = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      const requiredVariables = [
        '--legal-primary',
        '--legal-secondary',
        '--legal-dark',
        '--bg-primary-dark',
        '--bg-secondary-dark',
        '--text-primary-dark'
      ];

      const missingVariables: string[] = [];
      
      requiredVariables.forEach(variable => {
        const value = computedStyle.getPropertyValue(variable);
        if (!value || value.trim() === '') {
          missingVariables.push(variable);
        }
      });

      if (missingVariables.length > 0) {
        console.warn('🎨 LEGAL Theme QA: Variáveis CSS não definidas:', missingVariables);
      } else {
        console.log('✅ LEGAL Theme QA: Todas as variáveis CSS estão definidas corretamente');
      }
    };

    // Validação de contraste (simulação básica)
    const validateContrast = () => {
      if (typeof window !== 'undefined') {
        const elements = document.querySelectorAll('[data-theme-validate]');
        elements.forEach(element => {
          const styles = getComputedStyle(element);
          const bgColor = styles.backgroundColor;
          const textColor = styles.color;
          
          // Log para análise manual de contraste
          if (bgColor && textColor) {
            console.log(`🔍 Contraste - Elemento: ${element.tagName}, BG: ${bgColor}, Text: ${textColor}`);
          }
        });
      }
    };

    // Executar validações
    validateThemeVariables();
    validateContrast();
    
    // Log do estado atual do tema
    console.log(`🎨 LEGAL Theme QA - Tema atual: ${theme}`);
    
  }, [theme]);

  return <>{children}</>;
};

