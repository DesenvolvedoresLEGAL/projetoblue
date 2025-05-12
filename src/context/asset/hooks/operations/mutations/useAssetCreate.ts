
import { supabase } from '@/integrations/supabase/client';
import { Asset, ChipAsset, RouterAsset, AssetStatus } from '@/types/asset';
import { toast } from '@/utils/toast';

export const useAssetCreate = (
  assets: Asset[],
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>,
  mapStatusIdToAssetStatus: (statusId: number) => AssetStatus
) => {
  const addAsset = async (assetData: Omit<Asset, "id" | "status">): Promise<Asset | null> => {
    console.time('asset-create'); // Início da medição de tempo
    console.log('🚀 Iniciando criação de ativo:', assetData.type);
    
    try {
      // Default to 'Disponível' status (id = 1) if no status is provided
      const statusId = assetData.statusId || 1;
      
      // Prepare the base data for insertion
      const baseAssetData = {
        type_id: assetData.type === "CHIP" ? 1 : 2,
        status_id: statusId,
        model: assetData.type === "ROTEADOR" ? (assetData as any).model : undefined,
        serial_number: assetData.type === "ROTEADOR" ? (assetData as any).serialNumber : undefined,
        password: assetData.type === "ROTEADOR" ? (assetData as any).password : undefined,
        iccid: assetData.type === "CHIP" ? (assetData as any).iccid : undefined,
        line_number: assetData.type === "CHIP" ? (assetData as any).phoneNumber : undefined,
        manufacturer_id: assetData.type === "CHIP" ? 
          parseInt((assetData as any).carrier) || null : 
          parseInt((assetData as any).brand) || null
      };
      
      console.log('📤 Enviando dados para o Supabase:', JSON.stringify(baseAssetData));
      console.time('supabase-insert'); // Medir o tempo da chamada ao Supabase
      
      // Insert into the assets table
      const { data, error } = await supabase
        .from('assets')
        .insert(baseAssetData)
        .select()
        .single();
      
      console.timeEnd('supabase-insert');
      
      if (error) {
        console.error('❌ Erro ao inserir asset:', error);
        toast.error(`Erro ao cadastrar asset: ${error.message}`);
        return null;
      }
      
      console.log('✅ Dados retornados pelo Supabase:', data);
      
      // Create the asset object with the data returned
      let newAsset: Asset;
      
      if (assetData.type === "CHIP") {
        newAsset = {
          id: data.uuid,
          type: 'CHIP',
          registrationDate: new Date().toISOString(),
          status: mapStatusIdToAssetStatus(data.status_id),
          statusId: data.status_id,
          iccid: data.iccid || '',
          phoneNumber: data.line_number?.toString() || '',
          carrier: data.manufacturer_id?.toString() || '',
          notes: "" // Notes/observations not available
        } as ChipAsset;
      } else {
        newAsset = {
          id: data.uuid,
          type: 'ROTEADOR',
          registrationDate: new Date().toISOString(),
          status: mapStatusIdToAssetStatus(data.status_id),
          statusId: data.status_id,
          uniqueId: data.uuid || '',
          brand: data.manufacturer_id?.toString() || '',
          model: data.model || '',
          ssid: '',
          password: data.password || '',
          ipAddress: '',
          adminUser: '',
          adminPassword: '',
          imei: '',
          serialNumber: data.serial_number || '',
          notes: "", 
          hasWeakPassword: (assetData as any).hasWeakPassword,
          needsPasswordChange: (assetData as any).needsPasswordChange
        } as RouterAsset;
      }
      
      // Update the state
      console.log('🔄 Atualizando estado local com novo ativo');
      setAssets(prevAssets => [...prevAssets, newAsset]);
      toast.success(`${assetData.type === "CHIP" ? "Chip" : "Roteador"} cadastrado com sucesso`);
      
      console.log('✅ Ativo criado com sucesso:', newAsset.id);
      console.timeEnd('asset-create'); // Fim da medição de tempo total
      return newAsset;
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ativo:', error);
      console.timeEnd('asset-create');
      toast.error('Erro ao cadastrar ativo');
      return null;
    }
  };

  return { addAsset };
};
