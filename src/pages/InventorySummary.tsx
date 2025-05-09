
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageSearch, Wrench, ActivitySquare, Clock, Users, Building } from "lucide-react";
import { Link } from "react-router-dom";

const InventorySummary = () => {
  const categories = [
    {
      title: "Asset Management",
      description: "Manage your equipment, chips and other assets",
      icon: <PackageSearch className="h-6 w-6" />,
      links: [
        { label: "Assets", href: "/inventory/assets", description: "View and manage all registered assets" },
        { label: "Customers", href: "/inventory/customers", description: "Manage customer information" },
        { label: "Suppliers", href: "/inventory/suppliers", description: "Manage manufacturers and partners" }
      ]
    },
    {
      title: "Subscriptions & Plans",
      description: "Control service subscriptions and contracts",
      icon: <Clock className="h-6 w-6" />,
      links: [
        { label: "Subscriptions", href: "/inventory/subscriptions", description: "Manage active service subscriptions" }
      ]
    },
    {
      title: "Advanced Tools",
      description: "Special tools for asset management and analysis",
      icon: <Wrench className="h-6 w-6" />,
      links: [
        { label: "Tools Overview", href: "/inventory/tools", description: "Access all available tools" }
      ]
    },
    {
      title: "Monitoring & Activity",
      description: "Track and monitor system resources",
      icon: <ActivitySquare className="h-6 w-6" />,
      links: [
        { label: "Active Monitoring", href: "/inventory/monitoring/active", description: "View real-time asset status" },
        { label: "History", href: "/inventory/monitoring/history", description: "Review past activities and logs" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Module Summary</h1>
        <p className="text-muted-foreground mt-2">
          This module provides tools for managing assets, subscriptions, and monitoring resources.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-md">
                {category.icon}
              </div>
              <div>
                <CardTitle>{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.links.map((link, i) => (
                  <div key={i} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{link.label}</h3>
                        <p className="text-sm text-muted-foreground">{link.description}</p>
                      </div>
                      <Button asChild variant="outline">
                        <Link to={link.href}>Access</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InventorySummary;
