import { useState } from "react";
import { useAssets } from "@/context/useAssets";
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

export default function Subscriptions() {
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
      const thirtyDaysFromNow = addDays(new Date(), 30).toISOString();
      
      filtered = activeSubscriptions.filter(asset => {
        const endDate = new Date(asset.subscription?.endDate || "");
        const now = new Date();
        return isBefore(endDate, new Date(thirtyDaysFromNow)) && isAfter(endDate, now);
      });
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset => {
        const client = asset.clientId ? getClientById(asset.clientId) : null;
        const searchFields = [
          asset.id,
          asset.type,
          client?.name || "",
          client?.document || "",
          asset.subscription?.event || "",
          asset.type === "CHIP" 
            ? `${(asset as any).iccid} ${(asset as any).phoneNumber} ${(asset as any).carrier}`
            : `${(asset as any).uniqueId} ${(asset as any).brand} ${(asset as any).model}`
        ];
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setDisplayedAssets(filtered);
  }, [activeTab, searchTerm, subscriptionAssets, activeSubscriptions, expiredSubscriptions]);
  
  // Toggle select all assets
  const toggleSelectAll = () => {
    if (selectedAssets.length === displayedAssets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(displayedAssets.map(asset => asset.id));
    }
  };
  
  // Toggle select single asset
  const toggleSelectAsset = (assetId: string) => {
    if (selectedAssets.includes(assetId)) {
      setSelectedAssets(selectedAssets.filter(id => id !== assetId));
    } else {
      setSelectedAssets([...selectedAssets, assetId]);
    }
  };
  
  // Handle return to stock action
  const handleReturnToStock = () => {
    if (selectedAssets.length > 0) {
      returnAssetsToStock(selectedAssets);
      setSelectedAssets([]);
    }
  };
  
  // Handle extend subscription
  const handleExtendSubscription = () => {
    if (assetToExtend && newEndDate) {
      extendSubscription(assetToExtend.id, newEndDate);
      setShowExtendDialog(false);
      setAssetToExtend(null);
      setNewEndDate("");
    }
  };
  
  // Open extend dialog for an asset
  const openExtendDialog = (asset: Asset) => {
    setAssetToExtend(asset);
    
    // Default to extending by the original duration
    if (asset.subscription) {
      const startDate = new Date(asset.subscription.startDate);
      const currentEndDate = new Date(asset.subscription.endDate);
      let newEnd;
      
      if (asset.subscription.type === "MENSAL") {
        newEnd = addMonths(currentEndDate, 1);
      } else if (asset.subscription.type === "ANUAL") {
        newEnd = addYears(currentEndDate, 1);
      } else {
        // For custom, extend by the same duration as original
        const originalDuration = currentEndDate.getTime() - startDate.getTime();
        newEnd = new Date(currentEndDate.getTime() + originalDuration);
      }
      
      setNewEndDate(format(newEnd, "yyyy-MM-dd"));
    }
    
    setShowExtendDialog(true);
  };
  
  // Format date display
  const formatDateDisplay = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Data inválida";
    }
  };
  
  // Get time remaining or time elapsed
  const getTimeDistance = (dateString: string, expired = false) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true,
        locale: ptBR
      });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Assinaturas</h1>
          <p className="text-gray-500">Controle e monitore assinaturas e aluguéis de ativos</p>
        </div>
        
        {selectedAssets.length > 0 && (
          <Button 
            variant="destructive" 
            onClick={handleReturnToStock}
            className="flex items-center"
          >
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Retornar {selectedAssets.length} ativo(s) ao estoque
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por cliente, ativo ou evento..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all" className="flex items-center">
                <CalendarClock className="h-4 w-4 mr-2" />
                Todas ({subscriptionAssets.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Ativas ({activeSubscriptions.length})
              </TabsTrigger>
              <TabsTrigger value="ending-soon" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                A Vencer
              </TabsTrigger>
              <TabsTrigger value="expired" className="flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Expiradas ({expiredSubscriptions.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox 
                    checked={displayedAssets.length > 0 && selectedAssets.length === displayedAssets.length} 
                    onCheckedChange={toggleSelectAll} 
                  />
                </TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Nenhuma assinatura encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                displayedAssets.map((asset) => {
                  const client = asset.clientId ? getClientById(asset.clientId) : null;
                  const subscription = asset.subscription;
                  
                  // Determine if this subscription is ending soon (within 30 days)
                  const endDate = new Date(subscription?.endDate || "");
                  const thirtyDaysFromNow = addDays(new Date(), 30);
                  const isEndingSoon = !subscription?.isExpired && 
                                      isBefore(endDate, thirtyDaysFromNow) && 
                                      isAfter(endDate, new Date());
                  
                  return (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedAssets.includes(asset.id)} 
                          onCheckedChange={() => toggleSelectAsset(asset.id)} 
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {asset.type === "CHIP" ? 
                            `CHIP: ${(asset as any).phoneNumber}` : 
                            `ROTEADOR: ${(asset as any).model}`
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {asset.id.substring(0, 8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client ? (
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-xs text-gray-500">
                              {client.documentType}: {client.document}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{subscription?.type}</div>
                        {subscription?.event && (
                          <div className="text-xs text-gray-500">
                            Evento: {subscription.event}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateDisplay(subscription?.startDate || "")} a {formatDateDisplay(subscription?.endDate || "")}
                        </div>
                        <div className={`text-xs ${subscription?.isExpired ? "text-red-500" : isEndingSoon ? "text-amber-500" : "text-gray-500"}`}>
                          {subscription?.isExpired 
                            ? `Expirou ${getTimeDistance(subscription.endDate, true)}`
                            : `Expira ${getTimeDistance(subscription?.endDate || "")}`
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${subscription?.isExpired 
                            ? "bg-red-100 text-red-800" 
                            : isEndingSoon
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                          {subscription?.isExpired 
                            ? "Expirado" 
                            : isEndingSoon
                              ? "A Vencer"
                              : "Ativo"
                          }
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExtendDialog(asset)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" /> Renovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSelectAsset(asset.id)}
                          >
                            <PackageOpen className="h-4 w-4 mr-1" /> Retornar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renovar Assinatura</DialogTitle>
            <DialogDescription>
              Defina uma nova data de término para estender esta assinatura.
            </DialogDescription>
          </DialogHeader>
          
          {assetToExtend && assetToExtend.subscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Ativo</h4>
                  <p className="text-sm">
                    {assetToExtend.type === "CHIP" 
                      ? `CHIP: ${(assetToExtend as any).phoneNumber}` 
                      : `ROTEADOR: ${(assetToExtend as any).model}`
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Cliente</h4>
                  <p className="text-sm">
                    {assetToExtend.clientId 
                      ? getClientById(assetToExtend.clientId)?.name 
                      : "—"
                    }
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Tipo de Assinatura</h4>
                  <p className="text-sm">{assetToExtend.subscription.type}</p>
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Data Atual de Término</h4>
                  <p className="text-sm">{formatDateDisplay(assetToExtend.subscription.endDate)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Nova Data de Término</h4>
                <Input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExtendSubscription}>
              <RefreshCw className="h-4 w-4 mr-2" /> Confirmar Renovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
