
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import type { AssetCreateParams, AssetUpdateParams } from './types';
import { showFriendlyError } from '@/utils/errorTranslator';
import { mapDatabaseAssetToFrontend } from '@/utils/databaseMappers';

export async function createAsset(assetData: AssetCreateParams): Promise<Asset | null> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .insert(assetData)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao criar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'create');
      throw new Error(friendlyMessage);
    }

    return mapDatabaseAssetToFrontend(data);
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro na mutation createAsset:', error);
    const friendlyMessage = showFriendlyError(error, 'create');
    throw new Error(friendlyMessage);
  }
}

export async function updateAsset(
  id: string,
  updates: AssetUpdateParams,
): Promise<Asset | null> {
  try {
    const { data, error } = await supabase
      .from('assets')
      .update(updates)
      .eq('uuid', id)
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao atualizar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'update');
      throw new Error(friendlyMessage);
    }

    return mapDatabaseAssetToFrontend(data);
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro na mutation updateAsset:', error);
    const friendlyMessage = showFriendlyError(error, 'update');
    throw new Error(friendlyMessage);
  }
}

export async function deleteAsset(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('assets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('uuid', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao deletar asset:', error);
      const friendlyMessage = showFriendlyError(error, 'delete');
      throw new Error(friendlyMessage);
    }

    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error('Erro na mutation deleteAsset:', error);
    const friendlyMessage = showFriendlyError(error, 'delete');
    throw new Error(friendlyMessage);
  }
}
