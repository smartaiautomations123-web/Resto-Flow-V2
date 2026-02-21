import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Link2, Trash2, CheckCircle, XCircle, Webhook, BookOpen } from 'lucide-react';

export default function Integrations() {
  const [slackWebhook, setSlackWebhook] = useState('');
  const [teamsWebhook, setTeamsWebhook] = useState('');
  const [qbAuthCode, setQbAuthCode] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookEvent, setNewWebhookEvent] = useState('order.created');

  const utils = trpc.useUtils();

  // ─── Queries ─────────────────────────────────────────────────────────────
  const { data: integrations, isLoading } = trpc.settings.getIntegrations.useQuery();
  const { data: webhooks, isLoading: loadingWebhooks } = trpc.settings.getWebhooks.useQuery();

  // ─── Mutations ───────────────────────────────────────────────────────────
  const slackMut = trpc.settings.createSlackIntegration.useMutation({
    onSuccess: () => { toast.success('Slack integration connected'); setSlackWebhook(''); utils.settings.getIntegrations.invalidate(); },
    onError: () => toast.error('Failed to connect Slack'),
  });
  const teamsMut = trpc.settings.createTeamsIntegration.useMutation({
    onSuccess: () => { toast.success('Microsoft Teams integration connected'); setTeamsWebhook(''); utils.settings.getIntegrations.invalidate(); },
    onError: () => toast.error('Failed to connect Teams'),
  });
  const qbMut = trpc.settings.createQuickBooksIntegration.useMutation({
    onSuccess: () => { toast.success('QuickBooks integration connected'); setQbAuthCode(''); utils.settings.getIntegrations.invalidate(); },
    onError: () => toast.error('Failed to connect QuickBooks'),
  });
  const webhookMut = trpc.settings.createWebhook.useMutation({
    onSuccess: () => { toast.success('Webhook created'); setNewWebhookUrl(''); utils.settings.getWebhooks.invalidate(); },
    onError: () => toast.error('Failed to create webhook'),
  });
  const deleteMut = trpc.settings.deleteIntegration.useMutation({
    onSuccess: () => { toast.success('Integration removed'); utils.settings.getIntegrations.invalidate(); utils.settings.getWebhooks.invalidate(); },
    onError: () => toast.error('Failed to remove integration'),
  });

  const StatusIcon = ({ active }: { active: boolean }) =>
    active ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">Connect RestoFlow to your existing tools and services</p>
      </div>

      <Tabs defaultValue="messaging" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* ── Messaging ─────────────────────────────────────────────────── */}
        <TabsContent value="messaging" className="space-y-4">
          {/* Slack */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-lg">💬</div>
                  <div>
                    <CardTitle>Slack</CardTitle>
                    <CardDescription>Get order and alert notifications in Slack</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations?.slack?.active ? 'default' : 'secondary'}>
                  {integrations?.slack?.active ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {integrations?.slack?.active ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected to Slack · Webhook active</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate({ id: (integrations.slack as any).id })}>
                    <Trash2 className="w-3 h-3 mr-1" /> Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Incoming Webhook URL</Label>
                    <Input
                      value={slackWebhook}
                      onChange={e => setSlackWebhook(e.target.value)}
                      placeholder="https://hooks.slack.com/services/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Create an Incoming Webhook in your Slack workspace settings.
                    </p>
                  </div>
                  <Button onClick={() => slackMut.mutate({ webhookUrl: slackWebhook })} disabled={!slackWebhook || slackMut.isPending}>
                    <Link2 className="w-4 h-4 mr-2" />{slackMut.isPending ? 'Connecting…' : 'Connect Slack'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Microsoft Teams */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">🔷</div>
                  <div>
                    <CardTitle>Microsoft Teams</CardTitle>
                    <CardDescription>Receive operational alerts in Teams</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations?.teams?.active ? 'default' : 'secondary'}>
                  {integrations?.teams?.active ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {integrations?.teams?.active ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected to Microsoft Teams · Webhook active</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate({ id: (integrations.teams as any).id })}>
                    <Trash2 className="w-3 h-3 mr-1" /> Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Teams Incoming Webhook URL</Label>
                    <Input
                      value={teamsWebhook}
                      onChange={e => setTeamsWebhook(e.target.value)}
                      placeholder="https://outlook.office.com/webhook/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Create a connector in your Teams channel settings.
                    </p>
                  </div>
                  <Button onClick={() => teamsMut.mutate({ webhookUrl: teamsWebhook })} disabled={!teamsWebhook || teamsMut.isPending}>
                    <Link2 className="w-4 h-4 mr-2" />{teamsMut.isPending ? 'Connecting…' : 'Connect Teams'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Accounting ────────────────────────────────────────────────── */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-lg">📊</div>
                  <div>
                    <CardTitle>QuickBooks Online</CardTitle>
                    <CardDescription>Sync sales, expenses, and invoices with QuickBooks</CardDescription>
                  </div>
                </div>
                <Badge variant={integrations?.quickbooks?.active ? 'default' : 'secondary'}>
                  {integrations?.quickbooks?.active ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {integrations?.quickbooks?.active ? (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Connected to QuickBooks Online</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteMut.mutate({ id: (integrations.quickbooks as any).id })}>
                        <Trash2 className="w-3 h-3 mr-1" /> Disconnect
                      </Button>
                    </div>
                    {(integrations?.quickbooks as any)?.lastSyncedAt && (
                      <p className="text-xs text-muted-foreground mt-1">Last synced: {new Date((integrations?.quickbooks as any).lastSyncedAt).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Authorization Code</Label>
                    <Input
                      value={qbAuthCode}
                      onChange={e => setQbAuthCode(e.target.value)}
                      placeholder="Paste the authorization code from QuickBooks..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Authorize RestoFlow in your QuickBooks developer dashboard and paste the code above.
                    </p>
                  </div>
                  <Button onClick={() => qbMut.mutate({ authCode: qbAuthCode })} disabled={!qbAuthCode || qbMut.isPending}>
                    <BookOpen className="w-4 h-4 mr-2" />{qbMut.isPending ? 'Connecting…' : 'Connect QuickBooks'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Webhooks ──────────────────────────────────────────────────── */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Webhooks</CardTitle>
              <CardDescription>Send real-time HTTP callbacks to any endpoint when events occur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-2">
                  <Label>Endpoint URL</Label>
                  <Input
                    value={newWebhookUrl}
                    onChange={e => setNewWebhookUrl(e.target.value)}
                    placeholder="https://your-server.com/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Event</Label>
                  <Select value={newWebhookEvent} onValueChange={setNewWebhookEvent}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="order.created">order.created</SelectItem>
                      <SelectItem value="order.completed">order.completed</SelectItem>
                      <SelectItem value="order.cancelled">order.cancelled</SelectItem>
                      <SelectItem value="payment.received">payment.received</SelectItem>
                      <SelectItem value="reservation.created">reservation.created</SelectItem>
                      <SelectItem value="stock.low">stock.low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => webhookMut.mutate({ url: newWebhookUrl, event: newWebhookEvent })} disabled={!newWebhookUrl || webhookMut.isPending}>
                <Webhook className="w-4 h-4 mr-2" />{webhookMut.isPending ? 'Creating…' : 'Add Webhook'}
              </Button>

              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium">Active Webhooks</h3>
                {loadingWebhooks && <div className="text-sm text-muted-foreground">Loading…</div>}
                {(!webhooks || webhooks.length === 0) && !loadingWebhooks && (
                  <p className="text-sm text-muted-foreground text-center py-4">No webhooks configured yet.</p>
                )}
                {webhooks?.map((wh: any) => (
                  <div key={wh.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-mono text-xs">{wh.webhookUrl}</p>
                      <p className="text-xs text-muted-foreground">
                        Event: {wh.config ? (JSON.parse(wh.config).event ?? 'all') : 'all'}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate({ id: wh.id })}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Status ────────────────────────────────────────────────────── */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Overview of all connected services</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : (
                <div className="space-y-3">
                  {[
                    { name: 'Slack', description: 'Message notifications', active: !!integrations?.slack?.active },
                    { name: 'Microsoft Teams', description: 'Team collaboration alerts', active: !!integrations?.teams?.active },
                    { name: 'QuickBooks', description: 'Accounting sync', active: !!integrations?.quickbooks?.active },
                  ].map(item => (
                    <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon active={item.active} />
                        <Badge variant={item.active ? 'default' : 'secondary'}>
                          {item.active ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Custom Webhooks</p>
                      <p className="text-xs text-muted-foreground">{webhooks?.length ?? 0} active endpoint(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon active={(webhooks?.length ?? 0) > 0} />
                      <Badge variant={(webhooks?.length ?? 0) > 0 ? 'default' : 'secondary'}>
                        {(webhooks?.length ?? 0) > 0 ? `${webhooks!.length} Active` : 'None'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
