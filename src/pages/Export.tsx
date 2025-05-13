
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileDown, FileCheck } from "lucide-react";

const Export = () => {
  const [exportFormat, setExportFormat] = useState("csv");
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      // Show success notification or download file
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Export Inventory</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Export Settings</CardTitle>
            <CardDescription>
              Configure your export settings and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Include Fields</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-id" defaultChecked />
                  <Label htmlFor="field-id">Asset ID</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-name" defaultChecked />
                  <Label htmlFor="field-name">Asset Name</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-type" defaultChecked />
                  <Label htmlFor="field-type">Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-status" defaultChecked />
                  <Label htmlFor="field-status">Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-customer" defaultChecked />
                  <Label htmlFor="field-customer">Customer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-location" defaultChecked />
                  <Label htmlFor="field-location">Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-serial" />
                  <Label htmlFor="field-serial">Serial Number</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="field-purchase-date" />
                  <Label htmlFor="field-purchase-date">Purchase Date</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Filter by Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="status-active" defaultChecked />
                  <Label htmlFor="status-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="status-inactive" defaultChecked />
                  <Label htmlFor="status-inactive">Inactive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="status-faulty" defaultChecked />
                  <Label htmlFor="status-faulty">Faulty</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="status-archived" />
                  <Label htmlFor="status-archived">Archived</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Export Format</h3>
              <RadioGroup 
                defaultValue="csv" 
                value={exportFormat} 
                onValueChange={setExportFormat}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv">CSV</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel">Excel</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="json" id="json" />
                  <Label htmlFor="json">JSON</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline">Reset</Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>Processing...</>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
            <CardDescription>
              Previous export activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-2 border-b pb-3">
                <FileCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Full inventory (CSV)</p>
                  <p className="text-sm text-muted-foreground">Today, 12:30 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2 border-b pb-3">
                <FileCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Active assets (Excel)</p>
                  <p className="text-sm text-muted-foreground">Yesterday, 3:45 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <FileCheck className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Faulty assets (JSON)</p>
                  <p className="text-sm text-muted-foreground">May 12, 2023</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Export;
