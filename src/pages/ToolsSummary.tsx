
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Link as LinkIcon, Database, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

const ToolsSummary = () => {
  const tools = [
    {
      title: "Register Asset",
      description: "Add new equipment or chips to your inventory",
      icon: <PlusCircle className="h-6 w-6" />,
      path: "/inventory/tools/register-asset",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Associate Assets",
      description: "Link devices and chips for integrated management",
      icon: <LinkIcon className="h-6 w-6" />,
      path: "/inventory/tools/associate-assets",
      color: "bg-purple-100 text-purple-700"
    },
    {
      title: "Data Usage",
      description: "Track and analyze data consumption",
      icon: <Database className="h-6 w-6" />,
      path: "/inventory/tools/data-usage",
      color: "bg-green-100 text-green-700"
    },
    {
      title: "WiFi Analyzer",
      description: "Analyze wireless network performance",
      icon: <Wifi className="h-6 w-6" />,
      path: "/inventory/tools/wifi-analyzer",
      color: "bg-orange-100 text-orange-700"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Advanced Tools</h1>
        <p className="text-muted-foreground mt-2">
          Special tools for asset registration, association, and analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`${tool.color} p-2 rounded-md`}>
                {tool.icon}
              </div>
              <div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={tool.path}>Access Tool</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToolsSummary;
