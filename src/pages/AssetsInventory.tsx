
import React, { useState, useCallback } from 'react';
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

  // Controlador para atualização de ativos - com logs detalhados
  const handleAssetUpdated = useCallback(() => {
    console.log('🔄 Asset atualizado, recarregando dados...');
    setShouldFetch(true);
    // Força uma nova busca invalidando o cache
    refetch().then(() => {
      console.log('✅ Dados recarregados após atualização do asset');
    }).catch((err) => {
      console.error('❌ Erro ao recarregar dados após atualização:', err);
    });
  }, [refetch]);

  // Controlador para exclusão de ativos - com logs detalhados
  const handleAssetDeleted = useCallback(() => {
    console.log('🗑️ Asset deletado, recarregando dados...');
    setShouldFetch(true);
    // Força uma nova busca invalidando o cache
    refetch().then(() => {
      console.log('✅ Dados recarregados após exclusão do asset');
    }).catch((err) => {
      console.error('❌ Erro ao recarregar dados após exclusão:', err);
    });
  }, [refetch]);
  
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
    <div className="space-y-6">
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
      
      {assetsData?.totalPages && assetsData.totalPages > 1 && (
        <AssetsPagination 
          currentPage={currentPage}
          totalPages={assetsData.totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default AssetsInventory;
