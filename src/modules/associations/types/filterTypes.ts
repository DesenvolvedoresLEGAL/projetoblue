
export interface AssociationFilters {
  status: 'all' | 'active' | 'inactive';
  associationType: 'all' | number;
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
