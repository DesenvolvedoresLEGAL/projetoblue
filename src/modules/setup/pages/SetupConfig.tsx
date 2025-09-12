import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cog, Flag, Users, Webhook, Shield, Bell, Database, Save } from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rollout_percentage: number;
  target_users?: string[];
}

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  enabled: boolean;
  last_triggered?: string;
  status: 'active' | 'error' | 'pending';
}

const mockFeatureFlags: FeatureFlag[] = [
  {
    id: 'enable_uninstall',
    name: 'Fluxo de Desinstalação', 
    description: 'Habilita o fluxo completo de desinstalação de equipamentos',
    enabled: true,
    rollout_percentage: 100
  },
  {
    id: 'enable_signature_validation',
    name: 'Validação de Assinatura',
    description: 'Ativa validação jurídica automática das assinaturas eletrônicas',
    enabled: false,
    rollout_percentage: 25
  },
  {
    id: 'enable_realtime_notifications',
    name: 'Notificações em Tempo Real',
    description: 'Push notifications via FCM para técnicos e supervisores',
    enabled: true,
    rollout_percentage: 75
  }
];

const mockWebhooks: WebhookConfig[] = [
  {
    id: 'order_new',
    name: 'Novo Pedido',
    url: 'https://n8n.blue.com/webhook/order/new',
    events: ['order.created'],
    enabled: true,
    last_triggered: '2024-01-15T14:30:00Z',
    status: 'active'
  },
  {
    id: 'setup_completed',
    name: 'Setup Concluído',
    url: 'https://n8n.blue.com/webhook/setup/completed',
    events: ['setup.completed'],
    enabled: true,
    last_triggered: '2024-01-15T16:45:00Z',
    status: 'active'
  },
  {
    id: 'bi_export',
    name: 'Export BI Diário',
    url: 'https://bi.blue.com/api/import/setup-kpis',
    events: ['scheduled.daily'],
    enabled: true,
    last_triggered: '2024-01-15T06:00:00Z',
    status: 'active'
  }
];

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
};

const statusLabels = {
  active: 'Ativo',
  error: 'Erro', 
  pending: 'Pendente'
};

export const SetupConfig: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState(mockFeatureFlags);
  const [webhooks, setWebhooks] = useState(mockWebhooks);
  const [encryptionKey, setEncryptionKey] = useState('****************************');
  const [fcmConfig, setFcmConfig] = useState({
    vapid_key: 'BM-****-****-****',
    server_key: '****-****-****'
  });

  const handleFeatureFlagToggle = (flagId: string) => {
    setFeatureFlags(flags => 
      flags.map(flag => 
        flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag
      )
    );
  };

  const handleRolloutChange = (flagId: string, percentage: number) => {
    setFeatureFlags(flags => 
      flags.map(flag => 
        flag.id === flagId ? { ...flag, rollout_percentage: percentage } : flag
      )
    );
  };

  const handleWebhookToggle = (webhookId: string) => {
    setWebhooks(hooks => 
      hooks.map(hook => 
        hook.id === webhookId ? { ...hook, enabled: !hook.enabled } : hook
      )
    );
  };

  const handleSaveConfig = () => {
    // console.log('Salvando configurações...');
    // TODO: Implementar salvamento das configurações
  };

  const handleTestWebhook = (webhookId: string) => {
    // console.log('Testando webhook:', webhookId);
    // TODO: Implementar teste de webhook
  };

  const handleRegenerateKey = () => {
    // console.log('Regenerando chave de criptografia...');
    // TODO: Implementar regeneração da chave
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">
            Gestão de feature flags, roles, RLS, notificações e auditoria
          </p>
        </div>
        <Button onClick={handleSaveConfig}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <Tabs defaultValue="features" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Controle gradual de funcionalidades com rollout por percentual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {featureFlags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{flag.name}</h3>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Label className="text-sm">Rollout: {flag.rollout_percentage}%</Label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={flag.rollout_percentage}
                          onChange={(e) => handleRolloutChange(flag.id, Number(e.target.value))}
                          className="w-20"
                        />
                      </div>
                      <Switch
                        checked={flag.enabled}
                        onCheckedChange={() => handleFeatureFlagToggle(flag.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Criptografia e Segurança
              </CardTitle>
              <CardDescription>
                Configurações de criptografia AES-256-GCM e políticas RLS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="encryption-key">Chave Mestra de Criptografia</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="encryption-key"
                      type="password"
                      value={encryptionKey}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" onClick={handleRegenerateKey}>
                      Regenerar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Chave de 256 bits para criptografia client-side das evidências
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Políticas RLS Ativas</Label>
                    <div className="space-y-1 text-sm">
                      <p>✅ setups_select_installer</p>
                      <p>✅ setups_update_installer</p>
                      <p>✅ setups_approve_supervisor</p>
                      <p>✅ evidence_decrypt_admin</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Roles Configurados</Label>
                    <div className="space-y-1 text-sm">
                      <p>👷 installer_role (Técnicos)</p>
                      <p>👨‍💼 supervisor_role (Supervisores)</p>
                      <p>👑 admin_role (Administradores)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuração FCM
              </CardTitle>
              <CardDescription>
                Firebase Cloud Messaging para push notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vapid-key">VAPID Public Key</Label>
                <Input
                  id="vapid-key"
                  value={fcmConfig.vapid_key}
                  onChange={(e) => setFcmConfig({...fcmConfig, vapid_key: e.target.value})}
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="server-key">Server Key</Label>
                <Input
                  id="server-key"
                  type="password"
                  value={fcmConfig.server_key}
                  onChange={(e) => setFcmConfig({...fcmConfig, server_key: e.target.value})}
                  className="font-mono"
                />
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Tipos de Notificação</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Setup atribuído a técnico</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Setup aguardando aprovação</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Setup aprovado/rejeitado</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks n8n
              </CardTitle>
              <CardDescription>
                Integração com workflows de automação BLUE™
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Eventos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Disparo</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{webhook.name}</TableCell>
                      <TableCell className="font-mono text-sm">{webhook.url}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map(event => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[webhook.status]}>
                          {statusLabels[webhook.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {webhook.last_triggered ? 
                          new Date(webhook.last_triggered).toLocaleString('pt-BR') : 
                          'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Switch
                            checked={webhook.enabled}
                            onCheckedChange={() => handleWebhookToggle(webhook.id)}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTestWebhook(webhook.id)}
                          >
                            Testar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Auditoria e Logs
              </CardTitle>
              <CardDescription>
                Configuração de logs automáticos e retenção de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Configurações de Retenção</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Logs de Auditoria</Label>
                      <Select defaultValue="365">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="90">90 dias</SelectItem>
                          <SelectItem value="180">180 dias</SelectItem>
                          <SelectItem value="365">365 dias</SelectItem>
                          <SelectItem value="730">2 anos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Evidências Criptografadas</Label>
                      <Select defaultValue="1095">
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="365">1 ano</SelectItem>
                          <SelectItem value="1095">3 anos</SelectItem>
                          <SelectItem value="1825">5 anos</SelectItem>
                          <SelectItem value="-1">Permanente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Eventos Auditados</h4>
                  <div className="space-y-2 text-sm">
                    <p>✅ Criação/atualização de pedidos</p>
                    <p>✅ Mudanças de status em setups</p>
                    <p>✅ Upload/acesso a evidências</p>
                    <p>✅ Aprovações/rejeições de supervisores</p>
                    <p>✅ Alterações de configuração</p>
                    <p>✅ Acessos não autorizados</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Triggers Ativos</h4>
                <div className="space-y-1 text-sm font-mono text-muted-foreground">
                  <p>• log_change() → INSERT/UPDATE/DELETE em orders, setups, assets</p>
                  <p>• audit_access() → SELECT em evidências criptografadas</p>
                  <p>• log_config_change() → Alterações nesta página</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};