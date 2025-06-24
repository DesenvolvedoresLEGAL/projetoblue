
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Wifi, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface DirectSearchProps {
  onAssetFound: (asset: any) => void;
  searchSpecificAsset: (term: string, type: 'chip' | 'equipment') => Promise<any>;
}

export const DirectSearch: React.FC<DirectSearchProps> = ({
  onAssetFound,
  searchSpecificAsset
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'chip' | 'equipment'>('equipment');
  const [isSearching, setIsSearching] = useState(false);
  const isMobile = useIsMobile();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const asset = await searchSpecificAsset(searchTerm, searchType);
      if (asset) {
        onAssetFound(asset);
        setSearchTerm('');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Seletor de tipo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Tipo de Ativo</Label>
        <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          <Button
            type="button"
            variant={searchType === 'equipment' ? 'default' : 'outline'}
            onClick={() => {
              setSearchType('equipment');
              setSearchTerm('');
            }}
            className={`${isMobile ? 'h-10' : 'h-12'} justify-start`}
          >
            <Wifi className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Equipamento</div>
              {!isMobile && <div className="text-xs opacity-70">Por rádio</div>}
            </div>
          </Button>
          <Button
            type="button"
            variant={searchType === 'chip' ? 'default' : 'outline'}
            onClick={() => {
              setSearchType('chip');
              setSearchTerm('');
            }}
            className={`${isMobile ? 'h-10' : 'h-12'} justify-start`}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">CHIP</div>
              {!isMobile && <div className="text-xs opacity-70">Por ICCID</div>}
            </div>
          </Button>
        </div>
      </div>

      {/* Campo de busca */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {searchType === 'chip' ? 'ICCID do CHIP' : 'Rádio do Equipamento'}
        </Label>
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              searchType === 'chip' 
                ? 'Digite o ICCID...' 
                : 'Digite o número do rádio...'
            }
            disabled={isSearching}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchTerm.trim()}
            className={isMobile ? 'w-full' : 'min-w-[100px]'}
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
