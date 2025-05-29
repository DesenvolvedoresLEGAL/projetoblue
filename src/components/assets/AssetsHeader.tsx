
import React from 'react';
import { Package, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AssetsHeader = () => {
  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="text-center space-y-4 py-8 bg-gradient-to-r from-legal-primary/5 to-legal-secondary/5 rounded-xl border border-legal-primary/20">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-legal-primary rounded-lg shadow-lg">
            <Package className="h-8 w-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-black text-legal-dark font-neue-haas tracking-tight">
              Inventário de Ativos
            </h1>
            <p className="text-legal-primary font-bold font-neue-haas text-lg">
              Gestão Completa dos seus Equipamentos
            </p>
          </div>
        </div>
        
        <p className="text-gray-600 max-w-2xl mx-auto font-neue-haas">
          Visualize, gerencie e monitore todos os ativos tecnológicos da sua organização em um só lugar. 
          Controle total com transparência e eficiência.
        </p>
      </div>

      {/* Cards de Status Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-legal-primary/20 hover:border-legal-primary/40 transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-legal-primary/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-legal-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-neue-haas">Status Geral</p>
                <p className="font-black text-legal-dark font-neue-haas">Sistema Operacional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-legal-secondary/20 hover:border-legal-secondary/40 transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-legal-secondary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-legal-secondary" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-neue-haas">Performance</p>
                <p className="font-black text-legal-dark font-neue-haas">Otimizada</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-legal-dark/20 hover:border-legal-dark/40 transition-all duration-200 hover:shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-legal-dark/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-legal-dark" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-neue-haas">Monitoramento</p>
                <p className="font-black text-legal-dark font-neue-haas">Ativo 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetsHeader;
