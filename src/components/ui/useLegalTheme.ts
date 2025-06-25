import { createContext, useContext } from 'react'
import type { LegalThemeConfig, LegalThemeContextType } from './legal-theme-types'

export const LegalThemeContext = createContext<LegalThemeContextType | undefined>(undefined)

export const useLegalTheme = () => {
  const context = useContext(LegalThemeContext)
  if (context === undefined) {
    throw new Error('useLegalTheme deve ser usado dentro de um LegalThemeProvider')
  }
  return context
}

export type { LegalThemeConfig, LegalThemeContextType }

