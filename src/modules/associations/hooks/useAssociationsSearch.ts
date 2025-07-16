
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { ClientAssociationGroup, AssociationWithRelations } from '../types/associationsTypes';
import { detectSearchType, searchInText, searchInICCID } from '../utils/searchUtils';

interface UseAssociationsSearchProps {
  clientGroups: ClientAssociationGroup[];
  searchTerm: string;
}

interface SearchResults {
  filteredGroups: ClientAssociationGroup[];
  searchType: 'client_name' | 'iccid' | 'radio';
  totalMatches: number;
  isSearching: boolean;
}

export const useAssociationsSearch = ({ 
  clientGroups, 
  searchTerm 
}: UseAssociationsSearchProps): SearchResults => {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isSearching = searchTerm !== debouncedSearchTerm;

  const filteredGroups = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return clientGroups;
    }

    const searchType = detectSearchType(debouncedSearchTerm);
    
    return clientGroups.filter(group => {
      switch (searchType) {
        case 'client_name':
          return (
            searchInText(group.client.nome, debouncedSearchTerm) ||
            searchInText(group.client.empresa, debouncedSearchTerm)
          );
          
        case 'iccid':
          return group.associations.some(association => 
            searchInICCID(association.chip?.iccid || null, debouncedSearchTerm)
          );
          
        case 'radio':
          return group.associations.some(association => 
            searchInText(association.equipment?.radio || '', debouncedSearchTerm)
          );
          
        default:
          return false;
      }
    });
  }, [clientGroups, debouncedSearchTerm]);

  const searchType = detectSearchType(debouncedSearchTerm);
  const totalMatches = filteredGroups.length;

  return {
    filteredGroups,
    searchType,
    totalMatches,
    isSearching
  };
};
