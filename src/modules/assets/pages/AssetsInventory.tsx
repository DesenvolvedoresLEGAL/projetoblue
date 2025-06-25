
import React, { useState, useCallback, useEffect } from 'react';
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

  // Reset completo na montagem do componente
  useEffect(() => {
    console.log('🔄 AssetsInventory mounted - performing complete reset');
    
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
    
    console.log('✅ Complete reset performed on AssetsInventory mount');
  }, []); // Array vazio para executar apenas na montagem
  
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
    console.log('Executando busca com termo:', debouncedSearchTerm);
    setCurrentPage(1);
    setShouldFetch(true);
    refetch();
  }, [debouncedSearchTerm, refetch]);
  
  const handleSearchTermChange = useCallback((value: string) => {
    console.log('Termo de busca alterado para:', value);
    setSearchTerm(value);
    setCurrentPage(1);
    setShouldFetch(true);
  }, [setSearchTerm]);
  
  const handleFilterChange = useCallback((type: string, value: string) => {
    console.log(`Filtro ${type} alterado para:`, value);
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
    console.log('Asset atualizado, invalidando cache e recarregando dados...');
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);

  const handleAssetDeleted = useCallback(() => {
    console.log('Asset deletado, invalidando cache e recarregando dados...');
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);
  
  if (isLoading && !debouncedSearchTerm && filterType === 'all' && filterStatus === 'all' && filterManufacturer === 'all') {
    return <AssetsLoading />;
  }
  
  if (error || isError) {
    console.error('Erro na página AssetsInventory:', error);
    return (
      <AssetsError 
        error={error instanceof Error ? error : new Error('Erro desconhecido')} 
        refetch={() => {
          console.log('Tentando recarregar após erro...');
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
