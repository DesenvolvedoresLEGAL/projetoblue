export interface LegalThemeConfig {
  enableAnimations: boolean
  enableRippleEffect: boolean
  contrastMode: 'normal' | 'high'
  reducedMotion: boolean
}

export interface LegalThemeContextType {
  config: LegalThemeConfig
  updateConfig: (newConfig: Partial<LegalThemeConfig>) => void
}

