
import React from 'react';
import { Users, Smartphone, Router } from 'lucide-react';
import { AssociationStats } from '../../types/associationsTypes';

interface MobileStatsProps {
  stats: AssociationStats;
}

const MobileStats: React.FC<MobileStatsProps> = ({ stats }) => {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Resumo das Associações
      </h2>
      
      {/* Linha principal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{stats.totalClients}</div>
          <div className="text-xs text-muted-foreground">Clientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeAssociations}</div>
          <div className="text-xs text-muted-foreground">Ativas</div>
        </div>
      </div>
      
      {/* Chips e equipamentos */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Smartphone className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-sm font-medium text-blue-600">{stats.principalChips}</div>
          <div className="text-xs text-muted-foreground">Principal</div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Smartphone className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-sm font-medium text-purple-600">{stats.backupChips}</div>
          <div className="text-xs text-muted-foreground">Backup</div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Router className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-sm font-medium text-orange-600">{stats.equipmentOnly}</div>
          <div className="text-xs text-muted-foreground">Só Equip.</div>
        </div>
      </div>
    </div>
  );
};

export default MobileStats;
