
import React from 'react';
import { Loader2, Package, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const AssetsLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-primary/5 to-legal-secondary/5 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header Loading */}
        <Card className="border-legal-primary/20 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-legal-primary rounded-xl shadow-lg">
                    <Package className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 p-1 bg-legal-secondary rounded-full animate-pulse">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-black text-legal-dark font-neue-haas tracking-tight">
                    Carregando Inventário
                  </h1>
                  <p className="text-legal-primary font-bold font-neue-haas text-lg">
                    Buscando seus ativos...
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-legal-secondary">
                <Zap className="h-5 w-5 animate-pulse" />
                <span className="font-bold font-neue-haas">
                  Sincronizando dados em tempo real
                </span>
                <Zap className="h-5 w-5 animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton for Search Form */}
        <Card className="border-legal-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-legal-primary/20 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="w-48 h-4 bg-legal-primary/20 rounded animate-pulse"></div>
                  <div className="w-64 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton for Table */}
        <Card className="border-legal-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-legal-primary/5 rounded-lg">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-4 bg-legal-primary/20 rounded animate-pulse"></div>
                ))}
              </div>
              
              {/* Table Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                <div key={row} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-100">
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <div key={col} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading Messages */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 text-legal-primary animate-spin" />
            <span className="text-legal-dark font-bold font-neue-haas text-lg">
              Processando dados dos ativos...
            </span>
          </div>
          
          <p className="text-gray-600 font-neue-haas">
            Aguarde enquanto organizamos todas as informações para você
          </p>
          
          <div className="flex justify-center space-x-1 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-legal-secondary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetsLoading;
