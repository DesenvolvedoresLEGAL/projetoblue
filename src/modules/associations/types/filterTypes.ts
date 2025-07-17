
export interface AssociationFilters {
  status: 'all' | 'active' | 'inactive';
  associationType: 'all' | number;
  assetType: 'all' | 'chips_speedy' | 'chips' | 'equipment';
  manufacturer: 'all' | string;
  entryDateFrom?: Date;
  entryDateTo?: Date;
}

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface AssociationType {
  id: number;
  type: string;
}

export interface AssetTypeOption {
  value: string;
  label: string;
  solutionIds: number[];
}

export interface ManufacturerOption {
  value: string;
  label: string;
  type: 'manufacturer' | 'operator';
}
