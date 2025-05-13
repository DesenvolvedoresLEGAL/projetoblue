
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  Download, 
  Upload, 
  Search, 
  Filter 
} from "lucide-react";

const AssetsInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Mock data - would come from API in real app
  const mockAssets = [
    { id: "AST-001", name: "Router XG5000", type: "Router", status: "active", customer: "ABC Corp", location: "HQ" },
    { id: "AST-002", name: "Switch E300", type: "Switch", status: "active", customer: "XYZ Inc", location: "Branch 3" },
    { id: "AST-003", name: "Sensor T100", type: "Sensor", status: "faulty", customer: "ABC Corp", location: "Warehouse" },
    { id: "AST-004", name: "Router XG3000", type: "Router", status: "inactive", customer: "123 LLC", location: "Office 5" },
    { id: "AST-005", name: "Switch E100", type: "Switch", status: "active", customer: "XYZ Inc", location: "Branch 1" },
  ];
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>;
      case "faulty":
        return <Badge variant="destructive">Faulty</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Assets Inventory</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Asset
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="router">Router</SelectItem>
              <SelectItem value="switch">Switch</SelectItem>
              <SelectItem value="sensor">Sensor</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="faulty">Faulty</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAssets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">{asset.id}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.type}</TableCell>
                <TableCell>{getStatusBadge(asset.status)}</TableCell>
                <TableCell>{asset.customer}</TableCell>
                <TableCell>{asset.location}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AssetsInventory;
