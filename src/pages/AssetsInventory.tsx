
import React, { useState } from 'react';
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
  
  // Utilizando o hook personalizado para buscar dados dos ativos
  const { 
    data: assetsData,
    isLoading, 
    error, 
    refetch 
  } = useAssetsData({
    searchTerm,
    filterType,
    filterStatus,
    currentPage,
    pageSize: ASSETS_PER_PAGE
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Resetar para primeira página ao pesquisar
    refetch();
  };
  
  const handleFilterChange = (type: string, value: string) => {
    setCurrentPage(1); // Resetar para primeira página ao filtrar
    if (type === 'type') {
      setFilterType(value);
    } else if (type === 'status') {
      setFilterStatus(value);
    }
  };

  const handleAssetUpdated = () => {
    refetch();
  };

  const handleAssetDeleted = () => {
    refetch();
  };
  
  // Renderizar estado de carregamento
  if (isLoading) {
    return <AssetsLoading />;
  }
  
  // Renderizar estado de erro
  if (error) {
    return <AssetsError error={error instanceof Error ? error : new Error('Erro desconhecido')} refetch={refetch} />;
  }
  
  return (
    <div className="space-y-6">
      <AssetsHeader />
      
      <AssetsSearchForm 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
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
