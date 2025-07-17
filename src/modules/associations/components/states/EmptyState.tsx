
import React from 'react';
import { Search, Users, Database } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'no-data' | 'error';
  searchTerm?: string;
  onClearSearch?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  searchTerm, 
  onClearSearch 
}) => {
  const getContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: 'Nenhum resultado encontrado',
          description: `Não encontramos associações para "${searchTerm}"`,
          action: onClearSearch && (
            <button
              onClick={onClearSearch}
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              Limpar filtros
            </button>
          )
        };
      case 'no-data':
        return {
          icon: Users,
          title: 'Nenhuma associação encontrada',
          description: 'Ainda não há associações cadastradas no sistema',
          action: null
        };
      case 'error':
        return {
          icon: Database,
          title: 'Erro ao carregar dados',
          description: 'Ocorreu um problema ao buscar as associações',
          action: null
        };
      default:
        return {
          icon: Search,
          title: 'Nenhum resultado',
          description: 'Nenhuma informação disponível',
          action: null
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {content.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md">
        {content.description}
      </p>
      {content.action}
    </div>
  );
};

export default EmptyState;
