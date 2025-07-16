/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ConfigurationStepProps {
  state: any;
  dispatch: any;
}

export const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ state, dispatch }) => {
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);

  useEffect(() => {
    fetchAssociationTypes();
  }, []);

  const fetchSolutions = async () => {
  try {
    const { data, error } = await supabase
      .from('asset_solutions')
      .select('*')
      .is('deleted_at', null);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erro ao buscar soluções:", error);
    return [];
  }
};

  const fetchAssociationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('association_types')
        .select('*')
        .is('deleted_at', null)
        .order('id');

      if (error) throw error;
      setAssociationTypes(data || []);
    } catch (error) {
      console.error("Erro ao buscar tipos de associação:", error);
    }
  };

  const handleDateChange = (field: 'entryDate' | 'exitDate', value: string) => {
    dispatch({ 
      type: 'SET_DATES', 
      payload: { 
        ...state,
        [field]: value 
      } 
    });
  };

  const handleAssociationTypeChange = (value: string) => {
    dispatch({ type: 'SET_ASSOCIATION_TYPE', payload: parseInt(value) });
  };

  const handleAssetConfig = (assetId: string, field: string, value: string) => {
    const currentConfig = state.assetConfiguration[assetId] || {};
    dispatch({
      type: 'SET_ASSET_CONFIG',
      payload: {
        assetId,
        config: {
          ...currentConfig,
          [field]: value
        }
      }
    });
  };

  const equipmentAssets = state.selectedAssets.filter((asset: any) => asset.solution_id !== 11);

  return (
    <div className="space-y-6">
      {/* Date Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Período da Associação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="entry-date">Data de Início *</Label>
              <Input
                id="entry-date"
                type="date"
                value={state.entryDate}
                onChange={(e) => handleDateChange('entryDate', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="exit-date">Data de Fim (opcional)</Label>
              <Input
                id="exit-date"
                type="date"
                value={state.exitDate || ''}
                onChange={(e) => handleDateChange('exitDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Association Type */}
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Associação</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={state.associationType?.toString()}
            onValueChange={handleAssociationTypeChange}
          >
            {associationTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <RadioGroupItem value={type.id.toString()} id={`type-${type.id}`} />
                <Label htmlFor={`type-${type.id}`} className="capitalize">
                  {type.type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Equipment Configuration */}
      {equipmentAssets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Configuração de Equipamentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {equipmentAssets.map((asset: any) => {
              const config = state.assetConfiguration[asset.uuid] || {};
              
              return (
                <div key={asset.uuid} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">
                    {asset.radio || asset.serial_number || asset.model || "Equipamento"}
                  </h4>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`ssid-${asset.uuid}`}>SSID da Rede</Label>
                      <Input
                        id={`ssid-${asset.uuid}`}
                        placeholder="Nome da rede WiFi"
                        value={config.ssid || ''}
                        onChange={(e) => handleAssetConfig(asset.uuid, 'ssid', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`password-${asset.uuid}`}>Senha da Rede</Label>
                      <Input
                        id={`password-${asset.uuid}`}
                        type="password"
                        placeholder="Senha da rede WiFi"
                        value={config.password || ''}
                        onChange={(e) => handleAssetConfig(asset.uuid, 'password', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
