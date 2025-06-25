import React, { useState, useEffect } from "react";
import { useAssets } from "@/context/AssetProvider";
import { Asset, Client, SubscriptionInfo } from "@/types/asset";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarClock,
  Search,
  RefreshCw,
  PackageOpen,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowDownToLine,
} from "lucide-react";
import { format, addMonths, addYears, formatDistanceToNow, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const Subscriptions = () => {
  const { 
    assets, 
    clients, 
    getClientById, 
    updateAsset, 
    getExpiredSubscriptions,
    returnAssetsToStock,
    extendSubscription,
  } = useAssets();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [assetToExtend, setAssetToExtend] = useState<Asset | null>(null);
  const [newEndDate, setNewEndDate] = useState("");
  
  // Get all assets with subscriptions
  const subscriptionAssets = assets.filter(asset => asset.subscription);
  
  // Get assets with active subscriptions
  const activeSubscriptions = subscriptionAssets.filter(
    asset => !asset.subscription?.isExpired
  );
  
  // Get assets with expired subscriptions
  const expiredSubscriptions = getExpiredSubscriptions();
  
  // Assets to display based on active tab and search term
  const [displayedAssets, setDisplayedAssets] = useState<Asset[]>([]);
  
  // Update displayed assets when tab or search term changes
  useEffect(() => {
    let filtered: Asset[] = [];
    
    if (activeTab === "all") {
      filtered = subscriptionAssets;
    } else if (activeTab === "active") {
      filtered = activeSubscriptions;
    } else if (activeTab === "expired") {
      filtered = expiredSubscriptions;
    } else if (activeTab === "ending-soon") {
      // Assets expiring in the next 30 days
      const thirtyDaysFromNow = addDays(new Date(), 30);
      filtered = subscriptionAssets.filter(asset => {
        if (!asset.subscription?.endDate) return false;
        const endDate = new Date(asset.subscription.endDate);
        return isAfter(endDate, new Date()) && isBefore(endDate, thirtyDaysFromNow);
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset => {
        const client = getClientById(asset.clientId!);
        return (
          client?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.cnpj.includes(searchTerm) ||
          asset.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setDisplayedAssets(filtered);
  }, [activeTab, searchTerm, subscriptionAssets, activeSubscriptions, expiredSubscriptions, getClientById]);
  
  // Handle asset selection for bulk operations
  const handleAssetSelection = (assetId: string, checked: boolean) => {
    if (checked) {
      setSelectedAssets([...selectedAssets, assetId]);
    } else {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    }
  };
  
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAssets(displayedAssets.map(asset => asset.id));
    } else {
      setSelectedAssets([]);
    }
  };
  
  // Handle bulk return to stock
  const handleBulkReturnToStock = () => {
    returnAssetsToStock(selectedAssets);
    setSelectedAssets([]);
  };
  
  // Handle extend subscription
  const handleExtendSubscription = (asset: Asset) => {
    setAssetToExtend(asset);
    if (asset.subscription?.endDate) {
      setNewEndDate(asset.subscription.endDate.split('T')[0]);
    }
    setShowExtendDialog(true);
  };
  
  // Handle confirm extend subscription
  const handleConfirmExtendSubscription = () => {
    if (assetToExtend && newEndDate) {
      extendSubscription(assetToExtend.id, newEndDate);
      setShowExtendDialog(false);
      setAssetToExtend(null);
      setNewEndDate("");
    }
  };
  
  // Get subscription status badge
  const getSubscriptionStatusBadge = (asset: Asset) => {
    if (!asset.subscription) return null;
    
    const endDate = new Date(asset.subscription.endDate);
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    
    if (isBefore(endDate, now)) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Expirada</span>;
    } else if (isBefore(endDate, thirtyDaysFromNow)) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Expira em breve</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Ativa</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gerenciamento de Assinaturas</h1>
          <p className="text-muted-foreground">
            Monitore e gerencie as assinaturas de ativos dos clientes
          </p>
        </div>
        
        <div className="flex gap-2">
          {selectedAssets.length > 0 && (
            <Button 
              onClick={handleBulkReturnToStock}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PackageOpen className="h-4 w-4" />
              Retornar ao Estoque ({selectedAssets.length})
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por cliente ou ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">
            Todas ({subscriptionAssets.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Ativas ({activeSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="ending-soon">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Vencendo
            </div>
          </TabsTrigger>
          <TabsTrigger value="expired">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Expiradas ({expiredSubscriptions.length})
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {displayedAssets.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedAssets.length === displayedAssets.length}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Tipo de Assinatura</TableHead>
                        <TableHead>Data de Início</TableHead>
                        <TableHead>Data de Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedAssets.map((asset) => {
                        const client = getClientById(asset.clientId!);
                        return (
                          <TableRow key={asset.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedAssets.includes(asset.id)}
                                onCheckedChange={(checked) => 
                                  handleAssetSelection(asset.id, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{client?.nome}</div>
                                <div className="text-sm text-gray-500">{client?.cnpj}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{asset.id}</div>
                                <div className="text-sm text-gray-500">{asset.type}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {asset.subscription?.type || "N/A"}
                            </TableCell>
                            <TableCell>
                              {asset.subscription?.startDate ? 
                                format(new Date(asset.subscription.startDate), "dd/MM/yyyy", { locale: ptBR }) : 
                                "N/A"
                              }
                            </TableCell>
                            <TableCell>
                              {asset.subscription?.endDate ? (
                                <div>
                                  <div>{format(new Date(asset.subscription.endDate), "dd/MM/yyyy", { locale: ptBR })}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(asset.subscription.endDate), { 
                                      addSuffix: true, 
                                      locale: ptBR 
                                    })}
                                  </div>
                                </div>
                              ) : "N/A"}
                            </TableCell>
                            <TableCell>
                              {getSubscriptionStatusBadge(asset)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleExtendSubscription(asset)}
                                >
                                  <CalendarClock className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => returnAssetsToStock([asset.id])}
                                >
                                  <PackageOpen className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle2 className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-center text-gray-500">
                    {activeTab === "expired" 
                      ? "Nenhuma assinatura expirada encontrada."
                      : "Nenhuma assinatura encontrada com os filtros atuais."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estender Assinatura</DialogTitle>
            <DialogDescription>
              Defina uma nova data de vencimento para a assinatura do ativo{" "}
              {assetToExtend?.id}
              {assetToExtend?.clientId && (
                <span> do cliente {getClientById(assetToExtend.clientId)?.nome}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nova Data de Vencimento</label>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = addMonths(new Date(), 1);
                  setNewEndDate(date.toISOString().split('T')[0]);
                }}
              >
                +1 Mês
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = addMonths(new Date(), 3);
                  setNewEndDate(date.toISOString().split('T')[0]);
                }}
              >
                +3 Meses
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const date = addYears(new Date(), 1);
                  setNewEndDate(date.toISOString().split('T')[0]);
                }}
              >
                +1 Ano
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowExtendDialog(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmExtendSubscription}
              disabled={!newEndDate}
            >
              Confirmar Extensão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscriptions;
