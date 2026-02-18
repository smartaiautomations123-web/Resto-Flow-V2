import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, Check } from "lucide-react";

export function SmsSettings() {
  const { data: settings } = trpc.sms.getSettings.useQuery();
  const updateSettings = trpc.sms.updateSettings.useMutation();
  

  const [form, setForm] = useState({
    twilioAccountSid: settings?.twilioAccountSid || "",
    twilioAuthToken: settings?.twilioAuthToken || "",
    twilioPhoneNumber: settings?.twilioPhoneNumber || "",
    isEnabled: settings?.isEnabled || false,
  });

  const handleSave = async () => {
    await updateSettings.mutateAsync(form);
    toast.success("SMS settings updated");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SMS Notifications</h1>
        <p className="text-muted-foreground mt-1">Configure Twilio SMS integration for customer notifications.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Twilio Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Account SID</Label>
            <Input value={form.twilioAccountSid} onChange={(e) => setForm({ ...form, twilioAccountSid: e.target.value })} placeholder="AC..." />
          </div>
          <div>
            <Label>Auth Token</Label>
            <Input type="password" value={form.twilioAuthToken} onChange={(e) => setForm({ ...form, twilioAuthToken: e.target.value })} placeholder="Your auth token" />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input value={form.twilioPhoneNumber} onChange={(e) => setForm({ ...form, twilioPhoneNumber: e.target.value })} placeholder="+1234567890" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} />
            <Label>Enable SMS Notifications</Label>
          </div>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" /> Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
