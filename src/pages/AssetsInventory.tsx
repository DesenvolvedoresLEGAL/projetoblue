
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
  
  // Utilizando o hook personalizado para buscar dados dos ativos com controle de refetch
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
  
  // Função para controlar quando a busca será realizada
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('Executando busca com termo:', searchTerm);
    setCurrentPage(1); // Resetar para primeira página ao pesquisar
    setShouldFetch(true); // Ativar a consulta
    refetch();
  }, [searchTerm, refetch]);
  
  // Controlador do termo de busca com debounce implícito
  const handleSearchTermChange = useCallback((value: string) => {
    console.log('Termo de busca alterado para:', value);
    setSearchTerm(value);
    
    // Se o termo estiver vazio, busca imediatamente
    if (!value.trim()) {
      setShouldFetch(true);
      setCurrentPage(1);
    } else {
      // Para termos não vazios, aguarda submissão manual ou blur
      setShouldFetch(true);
    }
  }, []);
  
  // Controlador de filtros
  const handleFilterChange = useCallback((type: string, value: string) => {
    console.log(`Filtro ${type} alterado para:`, value);
    setCurrentPage(1); // Resetar para primeira página ao filtrar
    setShouldFetch(true); // Ativar a consulta quando um filtro mudar
    
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  }, []);

  // Controlador para atualização de ativos - CORRIGIDO
  const handleAssetUpdated = useCallback(() => {
    console.log('Asset atualizado, invalidando cache e recarregando dados...');
    
    // Invalidar todas as queries relacionadas a assets
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    
    // Forçar refetch específico
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);

  // Controlador para exclusão de ativos
  const handleAssetDeleted = useCallback(() => {
    console.log('Asset deletado, invalidando cache e recarregando dados...');
    
    // Invalidar todas as queries relacionadas a assets
    queryClient.invalidateQueries({ queryKey: ['assets'] });
    queryClient.invalidateQueries({ queryKey: ['assets-data'] });
    
    setShouldFetch(true);
    refetch();
  }, [queryClient, refetch]);
  
  // Renderizar estado de carregamento
  if (isLoading) {
    return <AssetsLoading />;
  }
  
  // Renderizar estado de erro com informações mais detalhadas
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
    <div className="container mx-auto space-y-6">
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
      
      {/* Debug info em desenvolvimento
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
          Debug: Termo="{searchTerm}" | Tipo="{filterType}" | Status="{filterStatus}" | 
          Página={currentPage} | Total={assetsData?.totalCount || 0}
        </div>
      )} */}
    </div>
  );
};

export default AssetsInventory;
