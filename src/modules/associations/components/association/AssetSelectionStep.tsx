
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAssetAssociationState } from '@modules/assets/hooks/useAssetAssociationState';
import { useAssetManagement } from '@modules/assets/hooks/useAssetManagement';
import { Search, Wifi, Smartphone, Plus, X } from 'lucide-react';
import { Asset } from '@/types/asset';

export const AssetSelectionStep: React.FC = () => {
  const { selectedAssets, addAsset, removeAsset, generalConfig, setGeneralConfig } = useAssetAssociationState();
  const { assets, isLoading } = useAssetManagement();
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filtrar apenas assets disponíveis
  const availableAssets = React.useMemo(() => {
    return assets.filter(asset => 
      asset.status === 'DISPONÍVEL' && 
      !selectedAssets.some(selected => selected.id === asset.id)
    );
  }, [assets, selectedAssets]);

  const filteredAssets = React.useMemo(() => {
    if (!searchTerm) return availableAssets;
    return availableAssets.filter(asset => {
      const searchLower = searchTerm.toLowerCase();
      const chipAsset = asset as any;
      return (
        asset.modelo?.toLowerCase().includes(searchLower) ||
        asset.marca?.toLowerCase().includes(searchLower) ||
        asset.serial_number?.toLowerCase().includes(searchLower) ||
        chipAsset.iccid?.toLowerCase().includes(searchLower) ||
        chipAsset.phoneNumber?.toLowerCase().includes(searchLower)
      );
    });
  }, [availableAssets, searchTerm]);

  const getAssetDisplayInfo = (asset: Asset) => {
    if (asset.type === 'CHIP') {
      const chipAsset = asset as any;
      return {
        title: `Chip ${chipAsset.carrier || asset.marca}`,
        subtitle: `ICCID: ${chipAsset.iccid || 'N/A'}`,
        detail: `Linha: ${chipAsset.phoneNumber || 'N/A'}`,
        icon: Smartphone
      };
    } else {
      const routerAsset = asset as any;
      return {
        title: `${asset.marca} ${asset.modelo}`,
        subtitle: `Série: ${asset.serial_number || 'N/A'}`,
        detail: routerAsset.ssid ? `SSID: ${routerAsset.ssid}` : '',
        icon: Wifi
      };
    }
  };

  const handleAssetSelect = (asset: Asset) => {
    const displayInfo = getAssetDisplayInfo(asset);
    addAsset({
      id: asset.id,
      type: asset.type,
      identifier: asset.type === 'CHIP' ? (asset as any).iccid : asset.serial_number || asset.id,
      title: displayInfo.title,
      subtitle: displayInfo.subtitle
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-gray-500" />
        <Input
          placeholder="Buscar asset por modelo, marca, série, ICCID ou linha..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Selected Assets */}
      {selectedAssets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Assets Selecionados ({selectedAssets.length})</h3>
            <div className="space-y-2">
              {selectedAssets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div className="flex items-center gap-2">
                    {asset.type === 'CHIP' ? <Smartphone className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
                    <div>
                      <p className="font-medium text-sm">{asset.title}</p>
                      <p className="text-xs text-gray-600">{asset.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAsset(asset.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Assets */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Assets Disponíveis</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando assets...</p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {filteredAssets.map((asset) => {
                const displayInfo = getAssetDisplayInfo(asset);
                const IconComponent = displayInfo.icon;
                
                return (
                  <div 
                    key={asset.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium">{displayInfo.title}</p>
                        <p className="text-sm text-gray-600">{displayInfo.subtitle}</p>
                        {displayInfo.detail && (
                          <p className="text-xs text-gray-500">{displayInfo.detail}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{asset.type}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Selecionar
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {filteredAssets.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum asset encontrado' : 'Nenhum asset disponível'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Form */}
      {selectedAssets.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Configurações da Associação</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data de Início</label>
                <Input
                  type="date"
                  value={generalConfig?.startDate ? 
                    (typeof generalConfig.startDate === 'string' ? 
                      generalConfig.startDate.split('T')[0] : 
                      generalConfig.startDate.toISOString().split('T')[0]
                    ) : ''
                  }
                  onChange={(e) => setGeneralConfig(prev => ({
                    ...prev,
                    startDate: e.target.value
                  }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Associação</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={generalConfig?.associationType || ''}
                  onChange={(e) => setGeneralConfig(prev => ({
                    ...prev,
                    associationType: Number(e.target.value)
                  }))}
                  required
                >
                  <option value="">Selecione...</option>
                  <option value={1}>Aluguel</option>
                  <option value={2}>Assinatura</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dias de Aluguel</label>
                <Input
                  type="number"
                  min="0"
                  value={generalConfig?.rentedDays || 0}
                  onChange={(e) => setGeneralConfig(prev => ({
                    ...prev,
                    rentedDays: Number(e.target.value)
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Observações</label>
                <Input
                  value={generalConfig?.notes || ''}
                  onChange={(e) => setGeneralConfig(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="Observações opcionais..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
