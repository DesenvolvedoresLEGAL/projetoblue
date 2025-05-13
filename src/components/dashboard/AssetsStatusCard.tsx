import React from "react";
import { useAssets } from "@/context/useAssets";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  Smartphone,
  Wifi,
  AlertCircle,
  XCircle,
  Clock,
} from "lucide-react";

/** Configuração visual de cada status */
const STATUS_CONFIG: Record<
  string,
  { icon: JSX.Element; color: string }
> = {
  DISPONÍVEL: {
    icon: <CheckCircle className="h-4 w-4 text-green-500" />,
    color: "bg-green-100",
  },
  ALUGADO: {
    icon: <Smartphone className="h-4 w-4 text-telecom-500" />,
    color: "bg-telecom-100",
  },
  ASSINATURA: {
    icon: <Wifi className="h-4 w-4 text-telecom-500" />,
    color: "bg-telecom-100",
  },
  "SEM DADOS": {
    icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
    color: "bg-amber-100",
  },
  BLOQUEADO: {
    icon: <XCircle className="h-4 w-4 text-red-500" />,
    color: "bg-red-100",
  },
  MANUTENÇÃO: {
    icon: <Clock className="h-4 w-4 text-blue-500" />,
    color: "bg-blue-100",
  },
};

const TYPES = [
  { key: "CHIP", label: "Status – Chips" },
  { key: "ROTEADOR", label: "Status – Speedy 5G" },
];

const AssetsStatusCard: React.FC = () => {
  const { assets, getAssetsByType } = useAssets();

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {TYPES.map(({ key, label }) => {
        const list = getAssetsByType(key);
        return (
          <Card key={key} className="flex-1 min-w-full">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Distribuição por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = list.filter((a) => a.status === status).length;
                  const percentage = list.length
                    ? Math.round((count / list.length) * 100)
                    : 0;

                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {cfg.icon}
                          <span className="ml-2 text-sm">{status}</span>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full ${cfg.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AssetsStatusCard;