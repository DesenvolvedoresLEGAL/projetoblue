
export interface AssociationFilters {
  status: 'all' | 'active' | 'inactive';
  associationType: 'all' | number;
  assetType: 'all' | 'speedy' | 'others';
  manufacturer: 'all' | number;
  dateRange: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface FilterOption {
  value: string | number;
  label: string;
  count?: number;
}

export interface AssociationTypeOption extends FilterOption {
  value: number;
}

export interface ManufacturerOption extends FilterOption {
  value: number;
  isOperator?: boolean;
}

export interface FilterCounts {
  total: number;
  active: number;
  inactive: number;
  byAssociationType: Record<number, number>;
  byAssetType: {
    speedy: number;
    others: number;
  };
  byManufacturer: Record<number, number>;
}

export const DEFAULT_FILTERS: AssociationFilters = {
  status: 'all',
  associationType: 'all',
  assetType: 'all',
  manufacturer: 'all',
  dateRange: {}
};

export const SPEEDY_SOLUTION_IDS = [1, 2, 4]; // SPEEDY 5G, 4BLACK, 4PLUS
