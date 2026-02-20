import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');

  // System Settings
  const { data: systemSettings, isLoading: loadingSystem } = trpc.settings.system.get.useQuery();
  const updateSystemSettings = trpc.settings.system.update.useMutation({
    onSuccess: () => toast({ title: 'System settings updated' }),
  });

  // User Preferences
  const { data: userPreferences, isLoading: loadingPreferences } = trpc.settings.userPreferences.get.useQuery();
  const updateUserPreferences = trpc.settings.userPreferences.update.useMutation({
    onSuccess: () => toast({ title: 'Preferences updated' }),
  });

  // Email Settings
  const { data: emailSettings, isLoading: loadingEmail } = trpc.settings.email.get.useQuery();
  const updateEmailSettings = trpc.settings.email.update.useMutation({
    onSuccess: () => toast({ title: 'Email settings updated' }),
  });

  // Payment Settings
  const { data: paymentSettings, isLoading: loadingPayment } = trpc.settings.payment.get.useQuery();
  const updatePaymentSettings = trpc.settings.payment.update.useMutation({
    onSuccess: () => toast({ title: 'Payment settings updated' }),
  });

  // Delivery Settings
  const { data: deliverySettings, isLoading: loadingDelivery } = trpc.settings.delivery.get.useQuery();
  const updateDeliverySettings = trpc.settings.delivery.update.useMutation({
    onSuccess: () => toast({ title: 'Delivery settings updated' }),
  });

  // Receipt Settings
  const { data: receiptSettings, isLoading: loadingReceipt } = trpc.settings.receipt.get.useQuery();
  const updateReceiptSettings = trpc.settings.receipt.update.useMutation({
    onSuccess: () => toast({ title: 'Receipt settings updated' }),
  });

  // Security Settings
  const { data: securitySettings, isLoading: loadingSecurity } = trpc.settings.security.get.useQuery();
  const updateSecuritySettings = trpc.settings.security.update.useMutation({
    onSuccess: () => toast({ title: 'Security settings updated' }),
  });

  // API Keys
  const { data: apiKeys, isLoading: loadingApiKeys } = trpc.settings.apiKeys.list.useQuery();
  const createApiKey = trpc.settings.apiKeys.create.useMutation({
    onSuccess: () => toast({ title: 'API key created' }),
  });
  const deleteApiKey = trpc.settings.apiKeys.delete.useMutation({
    onSuccess: () => toast({ title: 'API key deleted' }),
  });

  // Audit Log Settings
  const { data: auditSettings, isLoading: loadingAudit } = trpc.settings.auditLog.get.useQuery();
  const updateAuditSettings = trpc.settings.auditLog.update.useMutation({
    onSuccess: () => toast({ title: 'Audit settings updated' }),
  });

  // Backup Settings
  const { data: backupSettings, isLoading: loadingBackup } = trpc.settings.backup.get.useQuery();
  const updateBackupSettings = trpc.settings.backup.update.useMutation({
    onSuccess: () => toast({ title: 'Backup settings updated' }),
  });
  const triggerBackup = trpc.settings.backup.trigger.useMutation({
    onSuccess: () => toast({ title: 'Backup started' }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings & Configuration</h1>
        <p className="text-muted-foreground mt-2">Manage your restaurant's system configuration and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="receipt">Receipt</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Configure basic system settings for your restaurant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSystem ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name</Label>
                      <Input
                        id="restaurantName"
                        defaultValue={systemSettings?.restaurantName || ''}
                        placeholder="Enter restaurant name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue={systemSettings?.timezone || 'UTC'}>
                        <SelectTrigger id="timezone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern</SelectItem>
                          <SelectItem value="CST">Central</SelectItem>
                          <SelectItem value="MST">Mountain</SelectItem>
                          <SelectItem value="PST">Pacific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue={systemSettings?.currency || 'USD'}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD (C$)</SelectItem>
                          <SelectItem value="AUD">AUD (A$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue={systemSettings?.language || 'en'}>
                        <SelectTrigger id="language">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="it">Italian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={() => updateSystemSettings.mutate({})}>Save System Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your user experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPreferences ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="darkMode">Dark Mode</Label>
                      <Switch id="darkMode" defaultChecked={userPreferences?.darkMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notifications">Enable Notifications</Label>
                      <Switch id="notifications" defaultChecked={userPreferences?.enableNotifications} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sidebarCollapsed">Collapse Sidebar by Default</Label>
                      <Switch id="sidebarCollapsed" defaultChecked={userPreferences?.sidebarCollapsed} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="itemsPerPage">Items Per Page</Label>
                      <Input
                        id="itemsPerPage"
                        type="number"
                        defaultValue={userPreferences?.itemsPerPage || 20}
                        min="5"
                        max="100"
                      />
                    </div>
                  </div>
                  <Button onClick={() => updateUserPreferences.mutate({})}>Save Preferences</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure email settings for notifications and campaigns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingEmail ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        defaultValue={emailSettings?.smtpHost || ''}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        defaultValue={emailSettings?.smtpPort || 587}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        defaultValue={emailSettings?.smtpUsername || ''}
                        placeholder="your-email@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        defaultValue={emailSettings?.smtpPassword || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromEmail">From Email</Label>
                      <Input
                        id="fromEmail"
                        type="email"
                        defaultValue={emailSettings?.fromEmail || ''}
                        placeholder="noreply@restaurant.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fromName">From Name</Label>
                      <Input
                        id="fromName"
                        defaultValue={emailSettings?.fromName || ''}
                        placeholder="Your Restaurant"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="emailEnabled" defaultChecked={emailSettings?.isEnabled} />
                    <Label htmlFor="emailEnabled">Enable Email Notifications</Label>
                  </div>
                  <Button onClick={() => updateEmailSettings.mutate({})}>Save Email Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>Configure payment gateway and processing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingPayment ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gateway">Payment Gateway</Label>
                      <Select defaultValue={paymentSettings?.gateway || 'stripe'}>
                        <SelectTrigger id="gateway">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="authorize">Authorize.net</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        defaultValue={paymentSettings?.apiKey || ''}
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                    <Input
                      id="transactionFee"
                      type="number"
                      step="0.01"
                      defaultValue={paymentSettings?.transactionFee || 2.9}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="paymentEnabled" defaultChecked={paymentSettings?.isEnabled} />
                    <Label htmlFor="paymentEnabled">Enable Online Payments</Label>
                  </div>
                  <Button onClick={() => updatePaymentSettings.mutate({})}>Save Payment Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Settings */}
        <TabsContent value="delivery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Configuration</CardTitle>
              <CardDescription>Configure delivery and third-party integration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingDelivery ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="uberEats" defaultChecked={deliverySettings?.enableUberEats} />
                      <Label htmlFor="uberEats">Enable Uber Eats Integration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="doordash" defaultChecked={deliverySettings?.enableDoorDash} />
                      <Label htmlFor="doordash">Enable DoorDash Integration</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="grubhub" defaultChecked={deliverySettings?.enableGrubHub} />
                      <Label htmlFor="grubhub">Enable GrubHub Integration</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
                    <Input
                      id="deliveryRadius"
                      type="number"
                      defaultValue={deliverySettings?.deliveryRadius || 5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minDeliveryOrder">Minimum Order Value ($)</Label>
                    <Input
                      id="minDeliveryOrder"
                      type="number"
                      step="0.01"
                      defaultValue={deliverySettings?.minDeliveryOrder || 10}
                    />
                  </div>
                  <Button onClick={() => updateDeliverySettings.mutate({})}>Save Delivery Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Settings */}
        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Configuration</CardTitle>
              <CardDescription>Customize receipt printing and format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingReceipt ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="printLogo" defaultChecked={receiptSettings?.printLogo} />
                      <Label htmlFor="printLogo">Print Logo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="printTaxId" defaultChecked={receiptSettings?.printTaxId} />
                      <Label htmlFor="printTaxId">Print Tax ID</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="printWaiterId" defaultChecked={receiptSettings?.printWaiterId} />
                      <Label htmlFor="printWaiterId">Print Waiter ID</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="printTableNumber" defaultChecked={receiptSettings?.printTableNumber} />
                      <Label htmlFor="printTableNumber">Print Table Number</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      defaultValue={receiptSettings?.footerText || ''}
                      placeholder="Thank you for your visit!"
                    />
                  </div>
                  <Button onClick={() => updateReceiptSettings.mutate({})}>Save Receipt Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Configure security and access control settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSecurity ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="twoFactor" defaultChecked={securitySettings?.enableTwoFactor} />
                      <Label htmlFor="twoFactor">Require Two-Factor Authentication</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="sso" defaultChecked={securitySettings?.enableSSO} />
                      <Label htmlFor="sso">Enable Single Sign-On (SSO)</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordPolicy">Password Policy</Label>
                    <Select defaultValue={securitySettings?.passwordPolicy || 'medium'}>
                      <SelectTrigger id="passwordPolicy">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                        <SelectItem value="strong">Strong (12+ chars, special chars)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      defaultValue={securitySettings?.sessionTimeout || 30}
                    />
                  </div>
                  <Button onClick={() => updateSecuritySettings.mutate({})}>Save Security Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Management</CardTitle>
              <CardDescription>Create and manage API keys for third-party integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingApiKeys ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Button onClick={() => createApiKey.mutate({ name: 'New API Key' })}>
                      Create New API Key
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {apiKeys?.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{key.name}</p>
                          <p className="text-sm text-muted-foreground">{key.key}</p>
                          <p className="text-xs text-muted-foreground">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteApiKey.mutate({ id: key.id })}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Settings */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logging Configuration</CardTitle>
              <CardDescription>Configure audit logging for compliance and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingAudit ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="auditEnabled" defaultChecked={auditSettings?.isEnabled} />
                      <Label htmlFor="auditEnabled">Enable Audit Logging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="logUserActions" defaultChecked={auditSettings?.logUserActions} />
                      <Label htmlFor="logUserActions">Log User Actions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="logDataChanges" defaultChecked={auditSettings?.logDataChanges} />
                      <Label htmlFor="logDataChanges">Log Data Changes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="logSecurityEvents" defaultChecked={auditSettings?.logSecurityEvents} />
                      <Label htmlFor="logSecurityEvents">Log Security Events</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionDays">Log Retention (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      defaultValue={auditSettings?.retentionDays || 90}
                    />
                  </div>
                  <Button onClick={() => updateAuditSettings.mutate({})}>Save Audit Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Settings */}
        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Backup Configuration</CardTitle>
              <CardDescription>Configure automatic backups and data export</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingBackup ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="autoBackup" defaultChecked={backupSettings?.autoBackupEnabled} />
                      <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select defaultValue={backupSettings?.backupFrequency || 'daily'}>
                      <SelectTrigger id="backupFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupTime">Backup Time</Label>
                    <Input
                      id="backupTime"
                      type="time"
                      defaultValue={backupSettings?.backupTime || '02:00'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionBackup">Backup Retention (days)</Label>
                    <Input
                      id="retentionBackup"
                      type="number"
                      defaultValue={backupSettings?.retentionDays || 30}
                    />
                  </div>
                  <Button onClick={() => triggerBackup.mutate({})}>
                    Trigger Backup Now
                  </Button>
                  <Button onClick={() => updateBackupSettings.mutate({})}>Save Backup Settings</Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
