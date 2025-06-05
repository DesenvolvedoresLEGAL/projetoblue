
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  PackageSearch, 
  Link as LinkIcon, 
  AlertTriangle,
  FileText,
} from "lucide-react";

export function QuickActions() {
  const exportInventory = () => {
    // This would be implemented with actual export functionality
    alert("Export functionality would be implemented here");
  };

  const actions = [
    {
      icon: <PackageSearch className="h-5 w-5" />,
      label: "Register New Asset",
      description: "Add a new asset to inventory",
      path: "/inventory/tools/register-asset",
      color: "bg-[#4D2BFB] hover:bg-[#3D21CB]"
    },
    {
      icon: <LinkIcon className="h-5 w-5" />,
      label: "Link Asset to Client",
      description: "Associate assets with clients",
      path: "/inventory/tools/associate-assets",
      color: "bg-[#03F9FF] hover:bg-[#02D9DF] text-black hover:text-black"
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "View Problem Assets",
      description: "Check assets with issues",
      path: "/inventory/assets?status=BLOQUEADO,MANUTENÇÃO,SEM%20DADOS",
      color: "bg-amber-500 hover:bg-amber-600"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "Export Inventory",
      description: "Download as CSV file",
      action: exportInventory,
      color: "bg-[#020CBC] hover:bg-[#01069C]"
    }
  ];

  return (
    <Card className="rounded-2xl border shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          action.path ? (
            <Button 
              key={index}
              asChild
              className={`w-full justify-start gap-2 ${action.color} text-white`}
            >
              <Link to={action.path}>
                {action.icon}
                <div className="flex flex-col items-start text-sm">
                  <span>{action.label}</span>
                  <span className="text-xs opacity-80">{action.description}</span>
                </div>
              </Link>
            </Button>
          ) : (
            <Button 
              key={index}
              onClick={action.action}
              className={`w-full justify-start gap-2 ${action.color} text-white`}
            >
              {action.icon}
              <div className="flex flex-col items-start text-sm">
                <span>{action.label}</span>
                <span className="text-xs opacity-80">{action.description}</span>
              </div>
            </Button>
          )
        ))}
      </CardContent>
    </Card>
  );
}
