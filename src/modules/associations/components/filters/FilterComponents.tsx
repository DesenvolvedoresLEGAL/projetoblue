
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { AssociationFilters, FilterOption, AssociationTypeOption, ManufacturerOption } from '../../types/filterTypes';

interface FilterComponentProps {
  value: string | number;
  onValueChange: (value: string | number) => void;
  options: FilterOption[];
  placeholder: string;
  getOptionCount?: (value: string | number) => number;
}

export const StatusFilter: React.FC<{
  value: AssociationFilters['status'];
  onValueChange: (value: AssociationFilters['status']) => void;
  getOptionCount?: (value: string) => number;
}> = ({ value, onValueChange, getOptionCount }) => {
  const options = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Ativo' },
    { value: 'inactive', label: 'Inativo' }
  ];

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Status</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar status" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {getOptionCount && (
                  <Badge variant="secondary" className="ml-2">
                    {getOptionCount(option.value)}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const AssociationTypeFilter: React.FC<{
  value: AssociationFilters['associationType'];
  onValueChange: (value: AssociationFilters['associationType']) => void;
  options: AssociationTypeOption[];
  getOptionCount?: (value: string | number) => number;
}> = ({ value, onValueChange, options, getOptionCount }) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Tipo de Associação</label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onValueChange(val === 'all' ? 'all' : parseInt(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span>Todos</span>
              {getOptionCount && (
                <Badge variant="secondary" className="ml-2">
                  {getOptionCount('all')}
                </Badge>
              )}
            </div>
          </SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value.toString()}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {getOptionCount && (
                  <Badge variant="secondary" className="ml-2">
                    {getOptionCount(option.value)}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const AssetTypeFilter: React.FC<{
  value: AssociationFilters['assetType'];
  onValueChange: (value: AssociationFilters['assetType']) => void;
  getOptionCount?: (value: string) => number;
}> = ({ value, onValueChange, getOptionCount }) => {
  const options = [
    { value: 'all', label: 'Todos' },
    { value: 'speedy', label: 'SPEEDY (1,2,4)' },
    { value: 'others', label: 'Outros' }
  ];

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Tipo de Ativo</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar tipo" />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {getOptionCount && (
                  <Badge variant="secondary" className="ml-2">
                    {getOptionCount(option.value)}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const ManufacturerFilter: React.FC<{
  value: AssociationFilters['manufacturer'];
  onValueChange: (value: AssociationFilters['manufacturer']) => void;
  options: ManufacturerOption[];
  getOptionCount?: (value: string | number) => number;
}> = ({ value, onValueChange, options, getOptionCount }) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Fabricante/Operadora</label>
      <Select 
        value={value.toString()} 
        onValueChange={(val) => onValueChange(val === 'all' ? 'all' : parseInt(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar fabricante" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center justify-between w-full">
              <span>Todos</span>
              {getOptionCount && (
                <Badge variant="secondary" className="ml-2">
                  {getOptionCount('all')}
                </Badge>
              )}
            </div>
          </SelectItem>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value.toString()}>
              <div className="flex items-center justify-between w-full">
                <span>
                  {option.label}
                  {option.isOperator && (
                    <Badge variant="outline" className="ml-1 text-xs">
                      Operadora
                    </Badge>
                  )}
                </span>
                {getOptionCount && (
                  <Badge variant="secondary" className="ml-2">
                    {getOptionCount(option.value)}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const DateRangeFilter: React.FC<{
  value: AssociationFilters['dateRange'];
  onValueChange: (value: AssociationFilters['dateRange']) => void;
}> = ({ value, onValueChange }) => {
  const handleStartDateChange = (date: Date | undefined) => {
    onValueChange({ ...value, startDate: date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onValueChange({ ...value, endDate: date });
  };

  const clearDateRange = () => {
    onValueChange({});
  };

  const hasDateRange = Boolean(value.startDate || value.endDate);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">Período de Entrada</label>
        {hasDateRange && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDateRange}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <DatePicker
            date={value.startDate}
            setDate={handleStartDateChange}
            placeholder="Data início"
          />
        </div>
        <div>
          <DatePicker
            date={value.endDate}
            setDate={handleEndDateChange}
            placeholder="Data fim"
          />
        </div>
      </div>
    </div>
  );
};
