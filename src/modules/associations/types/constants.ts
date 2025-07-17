
// Constantes para tipos de associação
export const ASSOCIATION_TYPES = {
  LEASE: 1,      // Locação
  SUBSCRIPTION: 2 // Assinatura
} as const;

export type AssociationTypeId = typeof ASSOCIATION_TYPES[keyof typeof ASSOCIATION_TYPES];

// Mapeamento para labels legíveis
export const ASSOCIATION_TYPE_LABELS = {
  [ASSOCIATION_TYPES.LEASE]: 'Locação',
  [ASSOCIATION_TYPES.SUBSCRIPTION]: 'Assinatura'
} as const;

// Status de associação
export const ASSOCIATION_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

export type AssociationStatus = typeof ASSOCIATION_STATUS[keyof typeof ASSOCIATION_STATUS];
