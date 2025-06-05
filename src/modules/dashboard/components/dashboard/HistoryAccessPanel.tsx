
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
  const formatEventDescription = (event: string, details: any) => {
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
  const getAssetIdentifier = (details: any) => {
    if (!details) return 'N/A';
    
    if (details.radio) return details.radio;
    if (details.serial_number) return details.serial_number;
    if (details.iccid) return details.iccid;
    if (details.asset_id) return details.asset_id.substring(0, 8) + '...';
    
    return 'N/A';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Movimentações Recentes</TabsTrigger>
            <TabsTrigger value="clients">Por Cliente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="space-y-4">
            {isLoadingEvents ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Evento</TableHead>
                      <TableHead>Ativo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents?.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatRelativeTime(new Date(event.date))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatEventDescription(event.event, event.details)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PackageCheck className="h-4 w-4 text-blue-600" />
                            {getAssetIdentifier(event.details)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <Link to="/history">
                    <Button variant="outline">
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
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients?.map((client) => (
                  <TableRow key={client.uuid}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {client.nome}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link to={`/history?client=${client.uuid}`}>
                        <Button variant="outline" size="sm">
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
