
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar, X, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface AssociationsFiltersProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  statusFilter: 'all' | 'active' | 'ended' | 'today';
  setStatusFilter: (value: 'all' | 'active' | 'ended' | 'today') => void;
  debouncedSearchTerm: string;
  searchType: string;
  showDateFilters: boolean;
  setShowDateFilters: (show: boolean) => void;
  entryDateFrom: Date | undefined;
  setEntryDateFrom: (date: Date | undefined) => void;
  entryDateTo: Date | undefined;
  setEntryDateTo: (date: Date | undefined) => void;
  exitDateFrom: Date | undefined;
  setExitDateFrom: (date: Date | undefined) => void;
  exitDateTo: Date | undefined;
  setExitDateTo: (date: Date | undefined) => void;
  dateValidationError: string | null;
  hasActiveDateFilters: () => boolean;
  clearDateFilters: () => void;
}

export const AssociationsFilters: React.FC<AssociationsFiltersProps> = ({
  searchInput,
  setSearchInput,
  statusFilter,
  setStatusFilter,
  debouncedSearchTerm,
  searchType,
  showDateFilters,
  setShowDateFilters,
  entryDateFrom,
  setEntryDateFrom,
  entryDateTo,
  setEntryDateTo,
  exitDateFrom,
  setExitDateFrom,
  exitDateTo,
  setExitDateTo,
  dateValidationError,
  hasActiveDateFilters,
  clearDateFilters
}) => {
  return (
    <div className="space-y-6">
      {/* Filtros Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="search"
              placeholder="ID, nome do cliente, ICCID ou rádio..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          {debouncedSearchTerm && (
            <div className="text-xs text-muted-foreground">
              Tipo de busca detectado: {searchType === 'id' ? 'ID' : 
                searchType === 'iccid' ? 'ICCID' : 
                searchType === 'radio' ? 'Rádio' : 'Nome do cliente'}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativa</SelectItem>
              <SelectItem value="ended">Encerrada</SelectItem>
              <SelectItem value="today">Encerra hoje</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtros por Data - Colapsável */}
      <Card className="border-muted">
        <Collapsible open={showDateFilters} onOpenChange={setShowDateFilters}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <CardTitle className="text-base">
                    Filtrar por Data
                    {hasActiveDateFilters() && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    )}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  {hasActiveDateFilters() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearDateFilters();
                      }}
                      className="flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Limpar
                    </Button>
                  )}
                  {showDateFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {dateValidationError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">{dateValidationError}</span>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium">Data de Início</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <DatePicker
                      date={entryDateFrom}
                      setDate={setEntryDateFrom}
                      placeholder="Selecionar data inicial"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <DatePicker
                      date={entryDateTo}
                      setDate={setEntryDateTo}
                      placeholder="Selecionar data final"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Data de Fim</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">De</Label>
                    <DatePicker
                      date={exitDateFrom}
                      setDate={setExitDateFrom}
                      placeholder="Selecionar data inicial"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Até</Label>
                    <DatePicker
                      date={exitDateTo}
                      setDate={setExitDateTo}
                      placeholder="Selecionar data final"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};
