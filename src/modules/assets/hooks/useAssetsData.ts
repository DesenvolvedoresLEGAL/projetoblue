
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';

export type AssetWithRelations = {
  uuid: string;
  solution_id: number;
  status_id: number;
  model?: string;
  serial_number?: string;
  admin_pass?: string;
  iccid?: string;
  line_number?: number;
  manufacturer_id?: number;
  plan_id?: number;
  rented_days?: number;
  radio?: string;
  admin_user?: string;
  // Novos campos de configurações de rede - Fábrica
  ssid_fabrica?: string;
  pass_fabrica?: string;
  admin_user_fabrica?: string;
  admin_pass_fabrica?: string;
  // Novos campos de configurações de rede - Atuais
  ssid_atual?: string;
  pass_atual?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  solucao: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  manufacturer: {
    id: number;
    name: string;
  };
  plan?: {
    id: number;
    name: string;
    size_gb?: number;
  };
  // Propriedade para destacar qual campo correspondeu à busca
  matchedField?: string;
};

export interface UseAssetsDataParams {
  searchTerm?: string;
  filterType?: string;
  filterStatus?: string;
  filterManufacturer?: string;
  currentPage?: number;
  pageSize?: number;
  enabled?: boolean;
}

export interface AssetsDataResponse {
  assets: AssetWithRelations[];
  totalCount: number;
  totalPages: number;
}

// Função para sanitizar o termo de busca
const sanitizeSearchTerm = (term: string): string => {
  if (!term || typeof term !== 'string') return '';
  
  // Remove caracteres especiais que podem quebrar a query
  // Mantém apenas letras, números, espaços e alguns caracteres comuns
  return term
    .trim()
    .replace(/[^\w\s\-._@]/g, '') // Remove caracteres especiais perigosos
    .substring(0, 50); // Limita o tamanho máximo
};

// Função para detectar se o termo é numérico
const isNumericTerm = (term: string): boolean => {
  return /^\d+$/.test(term.trim());
};

// Função para detectar qual campo correspondeu à busca
const detectMatchedField = (asset: any, searchTerm: string): string => {
  if (!searchTerm) return '';
  
  const term = searchTerm.toLowerCase();
  
  // Verifica cada campo em ordem de prioridade
  if (asset.line_number && String(asset.line_number).toLowerCase().includes(term)) {
    return 'line_number';
  }
  if (asset.iccid && asset.iccid.toLowerCase().includes(term)) {
    return 'iccid';
  }
  if (asset.radio && asset.radio.toLowerCase().includes(term)) {
    return 'radio';
  }
  if (asset.serial_number && asset.serial_number.toLowerCase().includes(term)) {
    return 'serial_number';
  }
  if (asset.model && asset.model.toLowerCase().includes(term)) {
    return 'model';
  }
  
  return '';
};

export const useAssetsData = ({
  searchTerm = '',
  filterType = 'all',
  filterStatus = 'all',
  filterManufacturer = 'all',
  currentPage = 1,
  pageSize = 10,
  enabled = true
}: UseAssetsDataParams = {}) => {
  return useQuery({
    queryKey: ['assets', 'inventory', filterType, filterStatus, filterManufacturer, searchTerm, currentPage],
    queryFn: async (): Promise<AssetsDataResponse> => {
      try {
        console.log('Iniciando busca de assets com termo:', searchTerm);
        
        let query = supabase
          .from('assets')
          .select(`
            uuid,
            model,
            rented_days,
            serial_number,
            line_number,
            iccid,
            radio,
            created_at,
            updated_at,
            admin_user,
            admin_pass,
            solution_id,
            status_id,
            manufacturer_id,
            plan_id,
            ssid_fabrica,
            pass_fabrica,
            admin_user_fabrica,
            admin_pass_fabrica,
            ssid_atual,
            pass_atual,
            manufacturer:manufacturers(id, name),
            plano:plans(id, nome, tamanho_gb),
            status:asset_status(id, status),
            solucao:asset_solutions(id, solution)
          `)
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filterType !== 'all') {
          if (!isNaN(Number(filterType))) {
            query = query.eq('solution_id', Number(filterType));
          } else {
            const { data: solutionData } = await supabase
              .from('asset_solutions')
              .select('id')
              .eq('solution', filterType)
              .single();
            
            if (solutionData) {
              query = query.eq('solution_id', solutionData.id);
            }
          }
        }

        if (filterStatus !== 'all') {
          const { data: statusData } = await supabase
            .from('asset_status')
            .select('id')
            .ilike('status', filterStatus)
            .single();

          if (statusData) {
            query = query.eq('status_id', statusData.id);
          }
        }

        if (filterManufacturer !== 'all') {
          if (!isNaN(Number(filterManufacturer))) {
            query = query.eq('manufacturer_id', Number(filterManufacturer));
          } else {
            const { data: manufacturerData } = await supabase
              .from('manufacturers')
              .select('id')
              .ilike('name', filterManufacturer)
              .single();

            if (manufacturerData) {
              query = query.eq('manufacturer_id', manufacturerData.id);
            }
          }
        }

        // Implementação corrigida da busca multi-campo
        if (searchTerm) {
          const sanitizedTerm = sanitizeSearchTerm(searchTerm);
          
          if (sanitizedTerm.length >= 1) {
            console.log('Aplicando busca multi-campo com termo sanitizado:', sanitizedTerm);
            
            const isNumeric = isNumericTerm(sanitizedTerm);
            
            if (isNumeric) {
              // Para termos numéricos, busca principalmente em line_number e também em outros campos
              console.log('Termo numérico detectado, priorizando line_number');
              
              // Busca exata em line_number (bigint)
              const numericValue = parseInt(sanitizedTerm);
              
              // Combinamos busca exata em line_number com busca textual em outros campos
              query = query.or(
                `line_number.eq.${numericValue},` +
                `iccid.ilike.%${sanitizedTerm}%,` +
                `radio.ilike.%${sanitizedTerm}%,` +
                `serial_number.ilike.%${sanitizedTerm}%,` +
                `model.ilike.%${sanitizedTerm}%`
              );
            } else {
              // Para termos não-numéricos, busca apenas em campos textuais
              console.log('Termo textual detectado, buscando em campos de texto');
              
              query = query.or(
                `iccid.ilike.%${sanitizedTerm}%,` +
                `radio.ilike.%${sanitizedTerm}%,` +
                `serial_number.ilike.%${sanitizedTerm}%,` +
                `model.ilike.%${sanitizedTerm}%`
              );
            }
          }
        }

        // Add pagination
        const startIndex = (currentPage - 1) * pageSize;
        query = query.range(startIndex, startIndex + pageSize - 1);

        console.log('Executando query Supabase...');
        const { data, error, count } = await query;

        if (error) {
          console.error('Erro na query Supabase:', error);
          toast.error(`Erro ao carregar ativos: ${error.message}`);
          throw error;
        }

        console.log(`Query executada com sucesso. Retornados ${data?.length || 0} assets`);

        // Map the response to provide consistent property names and 
        // determine which field matched the search term
        const mappedAssets = data?.map(asset => {
          const matchedField = detectMatchedField(asset, searchTerm);
          
          return {
            ...asset,
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
            },
            admin_user: asset.admin_user,
            admin_pass: asset.admin_pass,
            matchedField
          };
        }) || [];

        // Get total count for pagination, excluding deleted items
        let countQuery = supabase
          .from('assets')
          .select('uuid', { count: 'exact', head: true })
          .is('deleted_at', null);

        // Apply same filters to count query
        if (filterType !== 'all') {
          if (!isNaN(Number(filterType))) {
            countQuery = countQuery.eq('solution_id', Number(filterType));
          }
        }

        if (filterStatus !== 'all') {
          const { data: statusData } = await supabase
            .from('asset_status')
            .select('id')
            .ilike('status', filterStatus)
            .single();

          if (statusData) {
            countQuery = countQuery.eq('status_id', statusData.id);
          }
        }

        if (filterManufacturer !== 'all') {
          if (!isNaN(Number(filterManufacturer))) {
            countQuery = countQuery.eq('manufacturer_id', Number(filterManufacturer));
          }
        }

        if (searchTerm) {
          const sanitizedTerm = sanitizeSearchTerm(searchTerm);
          if (sanitizedTerm.length >= 1) {
            const isNumeric = isNumericTerm(sanitizedTerm);
            
            if (isNumeric) {
              const numericValue = parseInt(sanitizedTerm);
              countQuery = countQuery.or(
                `line_number.eq.${numericValue},` +
                `iccid.ilike.%${sanitizedTerm}%,` +
                `radio.ilike.%${sanitizedTerm}%,` +
                `serial_number.ilike.%${sanitizedTerm}%,` +
                `model.ilike.%${sanitizedTerm}%`
              );
            } else {
              countQuery = countQuery.or(
                `iccid.ilike.%${sanitizedTerm}%,` +
                `radio.ilike.%${sanitizedTerm}%,` +
                `serial_number.ilike.%${sanitizedTerm}%,` +
                `model.ilike.%${sanitizedTerm}%`
              );
            }
          }
        }

        const { count: totalCount } = await countQuery;

        console.log(`Total de assets encontrados: ${totalCount || 0}`);

        return {
          assets: mappedAssets,
          totalCount: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / pageSize)
        };
      } catch (err) {
        console.error('Erro detalhado ao buscar ativos:', err);
        
        // Tratamento robusto de diferentes tipos de erro
        if (err instanceof Error) {
          if (err.message.includes('failed to parse logic tree')) {
            toast.error('Erro na sintaxe de busca. Termo simplificado automaticamente.');
          } else if (err.message.includes('timeout')) {
            toast.error('Busca demorou muito para responder. Tente novamente.');
          } else {
            toast.error(`Erro ao buscar ativos: ${err.message}`);
          }
        } else {
          toast.error('Erro desconhecido ao buscar ativos. Tente novamente.');
        }
        
        throw new Error('Falha ao buscar ativos. Por favor, tente novamente.');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    enabled: enabled,
    retry: (failureCount, error) => {
      // Implementa retry inteligente
      if (failureCount >= 2) return false;
      
      // Não faz retry para erros de sintaxe
      if (error instanceof Error && error.message.includes('failed to parse logic tree')) {
        return false;
      }
      
      return true;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useAssetsData;
