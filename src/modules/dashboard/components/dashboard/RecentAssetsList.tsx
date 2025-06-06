
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wifi, Smartphone, Server } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Asset {
  id: string;
  type: string;
  status: string;
  name?
}

interface RecentAssetsListProps {
  assets: Asset[];
}

function formatNumber(number){
    // número = +5599999999999
    const cleaned = ('' + number).replace(/\D/g, '');
    // número = 5599999999999
    const match = cleaned.match(/^(\d{2})(\d{2})(\d{4}|\d{5})(\d{4})$/);
    // número = 55 99 99999 9999
    if (match) {
        return ['(', match[2], ') ', match[3], '-', match[4]].join('')
    }
    // número = (99) 99999-9999
    return '';
}

export function RecentAssetsList({ assets }: RecentAssetsListProps) {
  const navigate = useNavigate();
  
  return (
    <Card className="rounded-2xl shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Últimos Ativos Registrados</CardTitle>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => navigate('/assets/inventory')}>
          Ver todos <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assets.map(asset => (
            <div key={asset.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {asset.type === "CHIP" && <Smartphone className="h-4 w-4 text-[#4D2BFB]" />}
                {asset.type != "CHIP" && <Wifi className="h-4 w-4 text-[#4D2BFB]" />}
                <div>
                  <p className="text-sm font-medium">
                    {asset.type === "CHIP" ? formatNumber(`+55${asset.name}`) : asset.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {asset.type}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{asset.status}</p>
              </div>
            </div>
          ))}

          {assets.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum ativo registrado recentemente
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
