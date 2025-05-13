
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, Network } from "lucide-react";

const Discovery = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Network Discovery</h1>
      </div>
      
      <Tabs defaultValue="snmp">
        <TabsList>
          <TabsTrigger value="snmp">SNMP Scan</TabsTrigger>
          <TabsTrigger value="netconf">NETCONF Scan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="snmp">
          <Card>
            <CardHeader>
              <CardTitle>SNMP Network Discovery</CardTitle>
              <CardDescription>
                Discover network devices using SNMP protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">IP Range Start</label>
                  <Input placeholder="192.168.1.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">IP Range End</label>
                  <Input placeholder="192.168.1.254" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">SNMP Version</label>
                  <Select defaultValue="v2c">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">SNMPv1</SelectItem>
                      <SelectItem value="v2c">SNMPv2c</SelectItem>
                      <SelectItem value="v3">SNMPv3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Community String</label>
                  <Input placeholder="public" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button>
                <Scan className="mr-2 h-4 w-4" />
                Start Scan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="netconf">
          <Card>
            <CardHeader>
              <CardTitle>NETCONF Discovery</CardTitle>
              <CardDescription>
                Discover network devices using NETCONF protocol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">IP Range Start</label>
                  <Input placeholder="192.168.1.1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">IP Range End</label>
                  <Input placeholder="192.168.1.254" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Username</label>
                  <Input placeholder="admin" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Password</label>
                  <Input placeholder="password" type="password" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">Reset</Button>
              <Button>
                <Network className="mr-2 h-4 w-4" />
                Start Scan
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Discovery;
