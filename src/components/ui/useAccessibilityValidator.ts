import { useEffect } from 'react'

/**
 * Hook para validação de acessibilidade
 */
export const useAccessibilityValidator = () => {
  useEffect(() => {
    // Verificar se elementos interativos têm labels adequados
    const validateAccessibility = () => {
      const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])')
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby]):not([id])')

      if (buttons.length > 0) {
        if (import.meta.env.DEV) console.warn('🔍 A11y: Botões sem labels de acessibilidade encontrados:', buttons.length)
      }

      if (inputs.length > 0) {
        if (import.meta.env.DEV) console.warn('🔍 A11y: Inputs sem labels de acessibilidade encontrados:', inputs.length)
      }

      // Verificar contraste de foco
      const focusableElements = document.querySelectorAll('[tabindex], button, input, select, textarea, a[href]')
      if (import.meta.env.DEV) console.log(`🔍 A11y: ${focusableElements.length} elementos focáveis encontrados`)
    }

    // Executar após um breve delay para permitir renderização
    const timeoutId = setTimeout(validateAccessibility, 1000)

    return () => clearTimeout(timeoutId)
  }, [])
}

