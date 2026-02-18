import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Mail, Plus } from "lucide-react";

export function EmailCampaigns() {
  const { data: campaigns } = trpc.emailCampaigns.getCampaigns.useQuery();
  const { data: templates } = trpc.emailCampaigns.getTemplates.useQuery();
  const createCampaign = trpc.emailCampaigns.createCampaign.useMutation();
  const { toast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: "", templateId: 0, segmentId: 0 });

  const handleCreate = async () => {
    if (!form.name || !form.templateId) {
      toast.error("Name and template required");
      return;
    }
    await createCampaign.mutateAsync(form);
    toast.success("Campaign created");
    setForm({ name: "", templateId: 0, segmentId: 0 });
    setShowDialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground mt-1">Create and manage email campaigns.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" /> Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-left p-2 font-medium">Status</th>
                <th className="text-left p-2 font-medium">Recipients</th>
                <th className="text-left p-2 font-medium">Opens</th>
              </tr>
            </thead>
            <tbody>
              {campaigns?.map((c) => (
                <tr key={c.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{c.name}</td>
                  <td className="p-2 text-sm">{c.status}</td>
                  <td className="p-2 text-sm">{c.recipientCount}</td>
                  <td className="p-2 text-sm">{c.openCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
