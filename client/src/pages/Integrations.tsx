import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { AlertCircle, CheckCircle, Slack, MessageSquare, DollarSign, Webhook } from 'lucide-react';

export default function Integrations() {
  const [slackWebhook, setSlackWebhook] = useState('');
  const [teamsWebhook, setTeamsWebhook] = useState('');
  const [qbAuthCode, setQbAuthCode] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState('order.created');

  const { data: integrations, isLoading } = trpc.settings.getIntegrations.useQuery();
  const { data: webhooks } = trpc.settings.getWebhooks.useQuery();

  const slackMutation = trpc.settings.createSlackIntegration.useMutation();
  const teamsMutation = trpc.settings.createTeamsIntegration.useMutation();
  const qbMutation = trpc.settings.createQuickBooksIntegration.useMutation();
  const webhookMutation = trpc.settings.createWebhook.useMutation();

  const handleSlackConnect = async () => {
    await slackMutation.mutateAsync({ webhookUrl: slackWebhook });
    setSlackWebhook('');
  };

  const handleTeamsConnect = async () => {
    await teamsMutation.mutateAsync({ webhookUrl: teamsWebhook });
    setTeamsWebhook('');
  };

  const handleQBConnect = async () => {
    await qbMutation.mutateAsync({ authCode: qbAuthCode });
    setQbAuthCode('');
  };

  const handleWebhookCreate = async () => {
    await webhookMutation.mutateAsync({
      url: webhookUrl,
      event: webhookEvent,
      active: true,
    });
    setWebhookUrl('');
  };

  if (isLoading) {
    return <div className="p-6">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-500 mt-2">Connect external services to RestoFlow</p>
      </div>

      <Tabs defaultValue="messaging" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="accounting">Accounting</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        {/* Messaging Integrations */}
        <TabsContent value="messaging" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Slack */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Slack className="w-5 h-5 text-[#36C5F0]" />
                  <CardTitle>Slack</CardTitle>
                </div>
                <CardDescription>Send notifications to Slack channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations?.slack?.active ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="slack-webhook">Webhook URL</Label>
                    <Input
                      id="slack-webhook"
                      placeholder="https://hooks.slack.com/services/..."
                      value={slackWebhook}
                      onChange={(e) => setSlackWebhook(e.target.value)}
                    />
                    <Button
                      onClick={handleSlackConnect}
                      disabled={!slackWebhook || slackMutation.isPending}
                      className="w-full"
                    >
                      {slackMutation.isPending ? 'Connecting...' : 'Connect Slack'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Microsoft Teams */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#6264A7]" />
                  <CardTitle>Microsoft Teams</CardTitle>
                </div>
                <CardDescription>Send notifications to Teams channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations?.teams?.active ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="teams-webhook">Webhook URL</Label>
                    <Input
                      id="teams-webhook"
                      placeholder="https://outlook.webhook.office.com/..."
                      value={teamsWebhook}
                      onChange={(e) => setTeamsWebhook(e.target.value)}
                    />
                    <Button
                      onClick={handleTeamsConnect}
                      disabled={!teamsWebhook || teamsMutation.isPending}
                      className="w-full"
                    >
                      {teamsMutation.isPending ? 'Connecting...' : 'Connect Teams'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounting Integrations */}
        <TabsContent value="accounting" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#1F8FE8]" />
                <CardTitle>QuickBooks Online</CardTitle>
              </div>
              <CardDescription>Sync financial data with QuickBooks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {integrations?.quickbooks?.active ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Connected</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last synced: {integrations.quickbooks.lastSyncedAt ? new Date(integrations.quickbooks.lastSyncedAt).toLocaleString() : 'Never'}
                  </p>
                  <Button variant="outline" className="w-full">
                    Sync Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="qb-auth">Authorization Code</Label>
                  <Input
                    id="qb-auth"
                    placeholder="Paste authorization code from QuickBooks"
                    value={qbAuthCode}
                    onChange={(e) => setQbAuthCode(e.target.value)}
                  />
                  <Button
                    onClick={handleQBConnect}
                    disabled={!qbAuthCode || qbMutation.isPending}
                    className="w-full"
                  >
                    {qbMutation.isPending ? 'Connecting...' : 'Connect QuickBooks'}
                  </Button>
                  <p className="text-xs text-gray-500">
                    <a href="https://quickbooks.intuit.com/app/oauth2/connect" className="text-blue-600 hover:underline">
                      Get authorization code
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                <CardTitle>Custom Webhooks</CardTitle>
              </div>
              <CardDescription>Send events to your custom endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://example.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-event">Event Type</Label>
                <select
                  id="webhook-event"
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="order.created">Order Created</option>
                  <option value="order.completed">Order Completed</option>
                  <option value="order.cancelled">Order Cancelled</option>
                  <option value="payment.received">Payment Received</option>
                  <option value="customer.created">Customer Created</option>
                  <option value="reservation.created">Reservation Created</option>
                </select>
              </div>
              <Button
                onClick={handleWebhookCreate}
                disabled={!webhookUrl || webhookMutation.isPending}
                className="w-full"
              >
                {webhookMutation.isPending ? 'Creating...' : 'Create Webhook'}
              </Button>

              {webhooks && webhooks.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold">Active Webhooks</h3>
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="p-3 border border-gray-200 rounded-md">
                      <p className="font-mono text-sm text-gray-600">{webhook.url}</p>
                      <p className="text-xs text-gray-500">Event: {webhook.event}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>Health and status of all integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {integrations && Object.entries(integrations).map(([name, status]) => (
                <div key={name} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <span className="capitalize font-medium">{name}</span>
                  {status?.active ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Inactive</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
