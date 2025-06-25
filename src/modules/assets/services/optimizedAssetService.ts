
import { supabase } from "@/integrations/supabase/client";
import { AssetWithRelations } from '@modules/assets/hooks/useAssetsData';

class OptimizedAssetService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
  
  private setCachedData<T>(key: string, data: T, ttlMs: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  async getAssetsByMultipleStatus(statusIds: number[]): Promise<AssetWithRelations[]> {
    const cacheKey = `assets-by-status-${statusIds.sort().join(',')}`;
    const cached = this.getCachedData<AssetWithRelations[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid,
        model,
        serial_number,
        line_number,
        iccid,
        radio,
        rented_days,
        admin_user,
        admin_pass,
        ssid_atual,
        pass_atual,
        created_at,
        updated_at,
        solution_id,
        status_id,
        manufacturer_id,
        plan_id,
        manufacturer:manufacturers(id, name),
        plano:plans(id, nome, tamanho_gb),
        status:asset_status(id, status),
        solucao:asset_solutions(id, solution)
      `)
      .in('status_id', statusIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedAssets = (data || []).map(asset => ({
      ...asset,
      rented_days: asset.rented_days || 0,
      admin_user: asset.admin_user || 'admin',
      admin_pass: asset.admin_pass || '',
      ssid_atual: asset.ssid_atual || '',
      pass_atual: asset.pass_atual || '',
      solucao: {
        id: asset.solucao?.id || 0,
        name: asset.solucao?.solution || 'Desconhecido'
      },
      status: {
        id: asset.status?.id || 0,
        name: asset.status?.status || 'Desconhecido'
      },
      manufacturer: {
        id: asset.manufacturer?.id || 0,
        name: asset.manufacturer?.name || 'Desconhecido'
      },
      plan: {
        id: asset.plano?.id || 0,
        name: asset.plano?.nome || 'Desconhecido',
        size_gb: asset.plano?.tamanho_gb || 0
      }
    }));

    this.setCachedData(cacheKey, mappedAssets, 180000); // 3 minutes cache
    return mappedAssets;
  }

  async getStatusSummary(): Promise<{ status: string; count: number; statusId: number }[]> {
    const cacheKey = 'status-summary';
    const cached = this.getCachedData<{ status: string; count: number; statusId: number }[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('assets')
      .select(`
        status_id,
        asset_status!inner(status)
      `)
      .is('deleted_at', null);

    if (error) throw error;

    const summary = (data || []).reduce((acc, item) => {
      const status = item.asset_status?.status || 'Unknown';
      const statusId = item.status_id;
      
      const existing = acc.find(s => s.statusId === statusId);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ status, count: 1, statusId });
      }
      return acc;
    }, [] as { status: string; count: number; statusId: number }[]);

    this.setCachedData(cacheKey, summary, 300000); // 5 minutes cache
    return summary;
  }

  async getRecentAssetsOptimized(limit: number = 10): Promise<AssetWithRelations[]> {
    const cacheKey = `recent-assets-${limit}`;
    const cached = this.getCachedData<AssetWithRelations[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('assets')
      .select(`
        uuid,
        model,
        serial_number, 
        line_number,
        iccid,
        radio,
        rented_days,
        admin_user,
        admin_pass,
        ssid_atual,
        pass_atual,
        created_at,
        updated_at,
        solution_id,
        status_id,
        manufacturer_id,
        plan_id,
        manufacturer:manufacturers(id, name),
        plano:plans(id, nome, tamanho_gb),
        status:asset_status(id, status),
        solucao:asset_solutions(id, solution)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const mappedAssets = (data || []).map(asset => ({
      ...asset,
      rented_days: asset.rented_days || 0,
      admin_user: asset.admin_user || 'admin',
      admin_pass: asset.admin_pass || '',
      ssid_atual: asset.ssid_atual || '',
      pass_atual: asset.pass_atual || '',
      solucao: {
        id: asset.solucao?.id || 0,
        name: asset.solucao?.solution || 'Desconhecido'
      },
      status: {
        id: asset.status?.id || 0,
        name: asset.status?.status || 'Desconhecido'
      },
      manufacturer: {
        id: asset.manufacturer?.id || 0,
        name: asset.manufacturer?.name || 'Desconhecido'
      },
      plan: {
        id: asset.plano?.id || 0,
        name: asset.plano?.nome || 'Desconhecido',
        size_gb: asset.plano?.tamanho_gb || 0
      }
    }));

    this.setCachedData(cacheKey, mappedAssets, 120000); // 2 minutes cache
    return mappedAssets;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheByPattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const optimizedAssetService = new OptimizedAssetService();
