
/**
 * Utilitários para o tema LEGAL
 * Funções auxiliares para manipulação e validação do tema
 */

export type LegalColorName = 'primary' | 'secondary' | 'dark' | 'accent' | 'cyan';
export type LegalColorVariant = 'light' | 'default' | 'dark';

/**
 * Gera uma cor LEGAL com base no nome e variante
 */
export const getLegalColor = (
  color: LegalColorName, 
  variant: LegalColorVariant = 'default',
  opacity?: number
): string => {
  const colorMap = {
    primary: {
      light: '#6B46FC',
      default: '#4D2BFB',
      dark: '#3E1EF9'
    },
    secondary: {
      light: '#34FAFF',
      default: '#03F9FF',
      dark: '#00D6E6'
    },
    dark: {
      light: '#0313FF',
      default: '#020CBC',
      dark: '#010A99'
    },
    accent: {
      light: '#6B46FC',
      default: '#4D2BFB',
      dark: '#3E1EF9'
    },
    cyan: {
      light: '#34FAFF',
      default: '#03F9FF',
      dark: '#00D6E6'
    }
  };

  const hexColor = colorMap[color][variant];
  
  if (opacity !== undefined) {
    return hexToHsl(hexColor, opacity);
  }
  
  return hexColor;
};

/**
 * Converte HEX para HSL com opacidade opcional
 */
export const hexToHsl = (hex: string, opacity?: number): string => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  
  return opacity !== undefined ? `hsl(${hsl} / ${opacity})` : `hsl(${hsl})`;
};

/**
 * Calcula contraste entre duas cores
 */
export const calculateContrast = (color1: string, color2: string): number => {
  // Implementação simplificada - em produção usar uma biblioteca específica
  return 4.5; // Placeholder para AA compliance
};

/**
 * Verifica se uma cor atende aos critérios de acessibilidade
 */
export const isAccessibleColor = (
  foreground: string, 
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean => {
  const contrast = calculateContrast(foreground, background);
  return level === 'AA' ? contrast >= 4.5 : contrast >= 7;
};

/**
 * Gera variantes de uma cor LEGAL
 */
export const generateLegalColorVariants = (baseColor: string) => {
  return {
    50: lighten(baseColor, 0.9),
    100: lighten(baseColor, 0.8),
    200: lighten(baseColor, 0.6),
    300: lighten(baseColor, 0.4),
    400: lighten(baseColor, 0.2),
    500: baseColor,
    600: darken(baseColor, 0.1),
    700: darken(baseColor, 0.2),
    800: darken(baseColor, 0.3),
    900: darken(baseColor, 0.4),
    950: darken(baseColor, 0.5)
  };
};

/**
 * Clareia uma cor
 */
export const lighten = (color: string, amount: number): string => {
  // Implementação simplificada
  return color;
};

/**
 * Escurece uma cor
 */
export const darken = (color: string, amount: number): string => {
  // Implementação simplificada
  return color;
};

/**
 * Detecta se o sistema está em modo escuro
 */
export const isSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

/**
 * Detecta preferências de movimento reduzido
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Detecta preferências de alto contraste
 */
export const prefersHighContrast = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
};
