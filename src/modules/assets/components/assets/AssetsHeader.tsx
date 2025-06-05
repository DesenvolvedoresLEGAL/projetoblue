
import React from 'react';
import { Package, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AssetsHeader = () => {
  return (
    <div className="space-y-6">
      {/* Header Principal com layout responsivo */}
      <div className="text-center space-y-4 py-6 md:py-8 px-4 md:px-8 bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5 rounded-xl border border-legal-primary/20">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="p-3 bg-legal-primary rounded-lg shadow-lg">
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-legal-dark font-neue-haas tracking-tight">
              Inventário de Ativos
            </h1>
            <p className="text-legal-primary font-bold font-neue-haas text-base sm:text-lg">
              Gestão Completa dos seus Equipamentos
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 max-w-2xl mx-auto font-neue-haas text-sm sm:text-base">
          Visualize, gerencie e monitore todos os ativos tecnológicos da sua organização em um só lugar. 
          Controle total com transparência e eficiência.
        </p>
      </div>
    </div>
  );
};

export default AssetsHeader;
