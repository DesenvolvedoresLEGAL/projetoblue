
import { useState } from "react";
import { useAssets } from "@/context/AssetContext";
import { AssetHistoryEntry } from "@/types/assetHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Wifi, Calendar, Search, User2 } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

export default function History() {
  const { history } = useAssets();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  const filteredHistory = history.filter((entry) => {
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesClient = entry.clientName.toLowerCase().includes(searchLower);
      const matchesAsset = entry.assets.some(
        asset => asset.identifier.toLowerCase().includes(searchLower)
      );
      const matchesEvent = entry.event?.toLowerCase().includes(searchLower);
      const matchesComment = entry.comments?.toLowerCase().includes(searchLower);
      
      if (!(matchesClient || matchesAsset || matchesEvent || matchesComment)) {
        return false;
      }
    }
    
    // Filter by tab type
    if (tab === "rental" && entry.operationType !== "ALUGUEL") {
      return false;
    }
    if (tab === "subscription" && entry.operationType !== "ASSINATURA") {
      return false;
    }
    
    return true;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getOperationBadgeStyle = (type: string) => {
    return type === "ASSINATURA" ? "bg-telecom-500" : "bg-blue-500";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Histórico de movimentações de ativos
        </p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por cliente, ativo, evento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="rental">Aluguel</TabsTrigger>
                <TabsTrigger value="subscription">Assinatura</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          {filteredHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ativos</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Evento</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatDate(entry.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4 text-gray-500" />
                          <span>{entry.clientName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {entry.assets.map((asset) => (
                            <div key={asset.id} className="flex items-center gap-2">
                              {asset.type === "CHIP" ? (
                                <Smartphone className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Wifi className="h-4 w-4 text-gray-500" />
                              )}
                              <span>{asset.identifier}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getOperationBadgeStyle(entry.operationType)}>
                          {entry.operationType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.event || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">
                          {entry.comments || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-center text-gray-500 mb-2">
                Nenhum registro encontrado no histórico.
              </p>
              <p className="text-center text-gray-400 text-sm">
                Os registros serão criados automaticamente quando ativos forem alugados ou assinados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
