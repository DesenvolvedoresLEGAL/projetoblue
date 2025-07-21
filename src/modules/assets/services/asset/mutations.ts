
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
      
      const friendlyMessage = showFriendlyError(error, 'create');
      throw new Error(friendlyMessage);
    }

    return mapDatabaseAssetToFrontend(data);
  } catch (error) {
    
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
      
      const friendlyMessage = showFriendlyError(error, 'update');
      throw new Error(friendlyMessage);
    }

    return mapDatabaseAssetToFrontend(data);
  } catch (error) {
    
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
      
      const friendlyMessage = showFriendlyError(error, 'delete');
      throw new Error(friendlyMessage);
    }

    return true;
  } catch (error) {
    
    const friendlyMessage = showFriendlyError(error, 'delete');
    throw new Error(friendlyMessage);
  }
}
