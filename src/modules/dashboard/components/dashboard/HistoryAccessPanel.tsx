
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRelativeTime } from '@/utils/dashboardUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar, User, PackageCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HistoryAccessPanel() {
  const { data: recentEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['recent-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_logs')
        .select('id, event, date, details, status_after_id, status_before_id, assoc_id')
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: 60000, // 1 minute
  });

  // If we need client data for the history panel
  const { data: clients } = useQuery({
    queryKey: ['clients-for-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('uuid, nome')
        .is('deleted_at', null)
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to format the event description
  const formatEventDescription = (event: string, details: Record<string, unknown> | null) => {
    if (details?.description) return details.description;
    
    if (event.includes('CRIADO')) {
      return 'Ativo registrado no sistema';
    } else if (event.includes('STATUS ATUALIZADO')) {
      return 'Status do ativo alterado';
    } else if (event === 'INSERT') {
      return 'Ativo associado a cliente';
    } else if (event === 'UPDATE') {
      return details?.exit_date ? 'Ativo desassociado de cliente' : 'Atualização na associação';
    }
    
    return event;
  };

  // Helper function to extract asset identifier
  const getAssetIdentifier = (details: Record<string, unknown> | null) => {
    if (!details) return 'N/A';
    
    if (details.radio) return details.radio;
    if (details.serial_number) return details.serial_number;
    if (details.iccid) return details.iccid;
    if (details.asset_id) return details.asset_id.substring(0, 8) + '...';
    
    return 'N/A';
  };

  return (
    <Card className="border-legal-primary/20 dark:border-legal-secondary/20 shadow-legal dark:shadow-legal-dark">
      <CardHeader>
        <CardTitle className="text-legal-primary dark:text-legal-secondary font-neue-haas">Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-4 bg-legal-primary/5 dark:bg-legal-secondary/5">
            <TabsTrigger 
              value="recent"
              className="data-[state=active]:bg-legal-primary data-[state=active]:text-white dark:data-[state=active]:bg-legal-secondary dark:data-[state=active]:text-legal-dark font-neue-haas"
            >
              Movimentações Recentes
            </TabsTrigger>
            <TabsTrigger 
              value="clients"
              className="data-[state=active]:bg-legal-primary data-[state=active]:text-white dark:data-[state=active]:bg-legal-secondary dark:data-[state=active]:text-legal-dark font-neue-haas"
            >
              Por Cliente
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {isLoadingEvents ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-legal-primary/10 dark:bg-legal-secondary/10" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-legal-primary/20 dark:border-legal-secondary/20">
                      <TableHead className="text-legal-primary dark:text-legal-secondary font-neue-haas">Data</TableHead>
                      <TableHead className="text-legal-primary dark:text-legal-secondary font-neue-haas">Evento</TableHead>
                      <TableHead className="text-legal-primary dark:text-legal-secondary font-neue-haas">Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents?.map((event) => (
                      <TableRow key={event.id} className="hover:bg-legal-primary/5 dark:hover:bg-legal-secondary/5 transition-colors duration-200">
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                            <span className="font-neue-haas text-legal-dark dark:text-text-primary-dark">
                              {formatRelativeTime(new Date(event.date))}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-neue-haas text-legal-dark dark:text-text-primary-dark">
                          {formatEventDescription(event.event, event.details)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-legal-primary dark:text-legal-secondary" />
                            <span className="font-neue-haas text-legal-dark dark:text-text-primary-dark">
                              {getAssetIdentifier(event.details)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <Link to="/history">
                    <Button 
                      variant="outline"
                      className="border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white dark:border-legal-secondary/30 dark:text-legal-secondary dark:hover:bg-legal-secondary dark:hover:text-legal-dark transition-all duration-200 font-neue-haas"
                    >
                      Ver histórico completo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow className="border-legal-primary/20 dark:border-legal-secondary/20">
                  <TableHead className="text-legal-primary dark:text-legal-secondary font-neue-haas">Cliente</TableHead>
                  <TableHead className="text-legal-primary dark:text-legal-secondary font-neue-haas">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.uuid} className="hover:bg-legal-primary/5 dark:hover:bg-legal-secondary/5 transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-legal-secondary dark:text-legal-secondary" />
                        <span className="font-neue-haas text-legal-dark dark:text-text-primary-dark">
                          {client.nome}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/history?client=${client.uuid}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-legal-primary/30 text-legal-primary hover:bg-legal-primary hover:text-white dark:border-legal-secondary/30 dark:text-legal-secondary dark:hover:bg-legal-secondary dark:hover:text-legal-dark transition-all duration-200 font-neue-haas"
                        >
                          Ver movimentações
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
