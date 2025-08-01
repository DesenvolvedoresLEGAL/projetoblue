
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { useURLFilters } from '@/hooks/useURLFilters';
import { useAssetsData } from '@modules/assets/hooks/useAssetsData';
import { useInventoryFiltersState } from '@modules/assets/hooks/useInventoryFiltersState';
import AssetsHeader from '@modules/assets/components/assets/AssetsHeader';
import AssetsSearchForm from '@modules/assets/components/assets/AssetsSearchForm';
import AssetsTable from '@modules/assets/components/assets/AssetsTable';
import AssetsPagination from '@modules/assets/components/assets/AssetsPagination';
import AssetsLoading from '@modules/assets/components/assets/AssetsLoading';
import AssetsError from '@modules/assets/components/assets/AssetsError';

const ASSETS_PER_PAGE = 10;

const AssetsInventory = () => {
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    filterManufacturer,
    setFilterManufacturer,
    resetFilters
  } = useInventoryFiltersState({ 
    shouldPersist: false, // Não persistir no localStorage
    resetOnMount: true    // Resetar na montagem
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldFetch, setShouldFetch] = useState(true);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const queryClient = useQueryClient();
  const hasMountedRef = useRef(false);
  
  // Hook para gerenciar filtros via URL - configurado para limpar na montagem
  const { updateURLParams, excludeSolutions, clearAllURLParams } = useURLFilters({
    setFilterType,
    setFilterStatus,
    setFilterManufacturer,
    filterType,
    filterStatus,
    filterManufacturer
  }, { 
    clearOnMount: true // Limpar URL na montagem
  });

  // Reset completo na primeira montagem do componente
  useEffect(() => {
    if (hasMountedRef.current) return;

    

    // Reset filtros
    resetFilters();

    // Limpar URL
    clearAllURLParams();

    // Reset página
    setCurrentPage(1);

    // Invalidar e refazer queries
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });

    // Forçar refetch
    setShouldFetch(true);

    hasMountedRef.current = true;

    
  }, [clearAllURLParams, queryClient, resetFilters]);
  
  const { 
    data: assetsData,
    isLoading, 
    error, 
    refetch,
    isError,
    isFetching
  } = useAssetsData({
    searchTerm: debouncedSearchTerm,
    filterType,
    filterStatus,
    filterManufacturer,
    currentPage,
    pageSize: ASSETS_PER_PAGE,
    enabled: shouldFetch,
    excludeSolutions: excludeSolutions?.map(id => Number(id)) || []
  });
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    setCurrentPage(1);
    setShouldFetch(true);
    refetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, refetch]);
  
  const handleSearchTermChange = useCallback((value: string) => {
    
    setSearchTerm(value);
    setCurrentPage(1);
    setShouldFetch(true);
  }, [setSearchTerm]);
  
  const handleFilterChange = useCallback((type: string, value: string) => {
    
    setCurrentPage(1);
    setShouldFetch(true);
    
    // Atualizar estado local
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    } else if (type === 'manufacturer') {
      setFilterManufacturer(value);
    }

    // Atualizar URL
    updateURLParams({
      [type]: value
    });
  }, [setFilterType, setFilterStatus, setFilterManufacturer, updateURLParams]);

  const handleAssetUpdated = useCallback(() => {
    
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);

  const handleAssetDeleted = useCallback(() => {
    
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);
  
  if (isLoading && !debouncedSearchTerm && filterType === 'all' && filterStatus === 'all' && filterManufacturer === 'all') {
    return <AssetsLoading />;
  }
  
  if (error || isError) {
    
    return (
      <AssetsError 
        error={error instanceof Error ? error : new Error('Erro desconhecido')} 
        refetch={() => {
          
          setShouldFetch(true);
          refetch();
        }} 
      />
    );
  }
  
  const isSearching = searchTerm !== debouncedSearchTerm || isFetching;
  
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-4 md:space-y-6">
      <AssetsHeader />
      
      <AssetsSearchForm
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermChange}
        filterType={filterType}
        filterStatus={filterStatus}
        filterManufacturer={filterManufacturer}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
        isSearching={isSearching}
      />
      
      {assetsData && (
        <AssetsTable 
          assets={assetsData.assets} 
          totalCount={assetsData.totalCount}
          onAssetUpdated={handleAssetUpdated}
          onAssetDeleted={handleAssetDeleted}
          currentPage={currentPage}
          pageSize={ASSETS_PER_PAGE}
          isLoading={isSearching}
        />
      )}
      
      {assetsData?.totalPages && assetsData.totalPages > 1 ? (
        <AssetsPagination 
          currentPage={currentPage}
          totalPages={assetsData.totalPages}
          setCurrentPage={setCurrentPage}
        />
      ) : null}
    </div>
  );
};

export default AssetsInventory;
