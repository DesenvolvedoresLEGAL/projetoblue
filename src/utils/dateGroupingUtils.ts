
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Association } from '@/types/associations';

export interface DateGroup {
  date: string; // YYYY-MM-DD format
  label: string; // "Hoje", "Ontem", ou "27/05/2025"
  associations: Association[];
}

/**
 * Agrupa associações por data de criação
 */
export const groupAssociationsByCreatedDate = (associations: Association[]): DateGroup[] => {
  // Agrupar por data (YYYY-MM-DD)
  const groupedByDate = associations.reduce((acc, association) => {
    const createdDate = association.created_at?.split('T')[0] || '';
    
    if (!acc[createdDate]) {
      acc[createdDate] = [];
    }
    acc[createdDate].push(association);
    
    return acc;
  }, {} as Record<string, Association[]>);

  // Converter para array de grupos e ordenar por data (mais recente primeiro)
  const dateGroups: DateGroup[] = Object.entries(groupedByDate)
    .map(([date, associations]) => ({
      date,
      label: formatDateGroupLabel(date),
      associations: associations.sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      )
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return dateGroups;
};

/**
 * Formata o label do grupo de data
 */
const formatDateGroupLabel = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Hoje';
    }
    
    if (isYesterday(date)) {
      return 'Ontem';
    }
    
    return `Criadas em ${format(date, 'dd/MM/yyyy', { locale: ptBR })}`;
  } catch (error) {
    return `Criadas em ${dateString}`;
  }
};

/**
 * Verifica se deve mostrar agrupamento (pelo menos 2 associações ou múltiplas datas)
 */
export const shouldShowDateGrouping = (dateGroups: DateGroup[]): boolean => {
  // Mostrar agrupamento se há mais de uma data ou se alguma data tem mais de 1 associação
  return dateGroups.length > 1 || dateGroups.some(group => group.associations.length > 1);
};
