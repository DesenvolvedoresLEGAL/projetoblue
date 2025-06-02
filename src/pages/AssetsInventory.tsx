import React, { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAssetsData } from '@/hooks/useAssetsData';
import AssetsHeader from '@/components/assets/AssetsHeader';
import AssetsSearchForm from '@/components/assets/AssetsSearchForm';
import AssetsTable from '@/components/assets/AssetsTable';
import AssetsPagination from '@/components/assets/AssetsPagination';
import AssetsLoading from '@/components/assets/AssetsLoading';
import AssetsError from '@/components/assets/AssetsError';

const ASSETS_PER_PAGE = 10;

const AssetsInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [shouldFetch, setShouldFetch] = useState(true);
  
  const queryClient = useQueryClient();
  
  const { 
    data: assetsData,
    isLoading, 
    error, 
    refetch,
    isError
  } = useAssetsData({
    searchTerm,
    filterType,
    filterStatus,
    currentPage,
    pageSize: ASSETS_PER_PAGE,
    enabled: shouldFetch
  });
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('Executando busca com termo:', searchTerm);
    setCurrentPage(1);
    setShouldFetch(true);
    refetch();
  }, [searchTerm, refetch]);
  
  const handleSearchTermChange = useCallback((value: string) => {
    console.log('Termo de busca alterado para:', value);
    setSearchTerm(value);
    
    if (!value.trim()) {
      setShouldFetch(true);
      setCurrentPage(1);
    } else {
      setShouldFetch(true);
    }
  }, []);
  
  const handleFilterChange = useCallback((type: string, value: string) => {
    console.log(`Filtro ${type} alterado para:`, value);
    setCurrentPage(1);
    setShouldFetch(true);
    
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  }, []);

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
  
  if (isLoading) {
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
  
  return (
    <div className="container mx-auto px-4 md:px-6 space-y-4 md:space-y-6">
      <AssetsHeader />
      
      <AssetsSearchForm 
        searchTerm={searchTerm}
        setSearchTerm={handleSearchTermChange}
        filterType={filterType}
        filterStatus={filterStatus}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
      />
      
      {assetsData?.assets && (
        <AssetsTable 
          assets={assetsData.assets} 
          onAssetUpdated={handleAssetUpdated}
          onAssetDeleted={handleAssetDeleted}
          currentPage={currentPage}
          pageSize={ASSETS_PER_PAGE}
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
