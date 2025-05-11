
import React from "react";
import { Asset, Client } from "@/types/asset";
import { TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, PackageOpen } from "lucide-react";
import { format, addDays, isAfter, isBefore, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SubscriptionRowProps {
  asset: Asset;
  client: Client | undefined;
  isSelected: boolean;
  toggleSelectAsset: (id: string) => void;
  openExtendDialog: (asset: Asset) => void;
}

export const SubscriptionRow: React.FC<SubscriptionRowProps> = ({
  asset,
  client,
  isSelected,
  toggleSelectAsset,
  openExtendDialog,
}) => {
  const subscription = asset.subscription;
  if (!subscription) return null;

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

  // Determine if this subscription is ending soon (within 30 days)
  const endDate = new Date(subscription?.endDate || "");
  const thirtyDaysFromNow = addDays(new Date(), 30);
  const isEndingSoon = !subscription?.isExpired && 
                        isBefore(endDate, thirtyDaysFromNow) && 
                        isAfter(endDate, new Date());

  return (
    <TableRow>
      <TableCell>
        <Checkbox 
          checked={isSelected} 
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
};
