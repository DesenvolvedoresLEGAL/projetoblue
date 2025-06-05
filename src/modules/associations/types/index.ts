
// Tipos para o módulo de associações
export interface AssetAssociationState {
  selectedAssets: any[];
  currentStep: number;
  isLoading: boolean;
}

export interface AssetConfiguration {
  assetId: string;
  configuration: any;
}
