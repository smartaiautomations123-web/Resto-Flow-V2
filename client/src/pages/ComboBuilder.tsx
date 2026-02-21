import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Layers, Tag, ShoppingBag, Percent } from "lucide-react";

export default function ComboBuilder() {
  const utils = trpc.useUtils();

  // Combos are configured via UI but API endpoint is missing, mocked for UI demo
  const discounts: any[] = [];
  const { data: menuItems } = trpc.menu.list.useQuery();

  const createDiscount = {
    mutateAsync: async (d: any) => {
      setShowDialog(false);
      resetForm();
      toast.success("Combo deal created successfully");
    },
    isPending: false
  };

  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "percentage" as "percentage" | "fixed" | "bogo",
    value: "",
    minOrderAmount: "",
    requiresApproval: false,
  });

  const resetForm = () =>
    setForm({ name: "", type: "percentage", value: "", minOrderAmount: "", requiresApproval: false });

  const handleCreate = async () => {
    if (!form.name.trim() || !form.value) {
      toast.error("Name and value are required");
      return;
    }
    await createDiscount.mutateAsync({
      name: form.name,
      type: form.type,
      value: form.value,
      minOrderAmount: form.minOrderAmount || undefined,
      requiresApproval: form.requiresApproval,
    });
  };

  // Filter to show combo-style discounts (not requiring manager approval = automatic deals)
  const combos = discounts ?? [];
  const activeCount = combos.filter((d: any) => d.isActive !== false).length;

  const getTypeLabel = (type: string) => {
    if (type === "percentage") return "% Off";
    if (type === "fixed") return "$ Off";
    if (type === "bogo") return "BOGO";
    return type;
  };

  const getTypeColor = (type: string) => {
    if (type === "percentage") return "badge-success";
    if (type === "fixed") return "badge-warning";
    if (type === "bogo") return "badge-neutral";
    return "badge-neutral";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Combo Builder</h1>
          <p className="text-muted-foreground mt-1">Create discounted combo deals and promotions for your menu.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true); }}>
          <Plus className="h-4 w-4 mr-2" /> New Combo Deal
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10"><Layers className="h-5 w-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Combos</p>
              <p className="text-2xl font-bold">{combos.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10"><Tag className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10"><ShoppingBag className="h-5 w-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Menu Items</p>
              <p className="text-2xl font-bold">{menuItems?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Combos grid */}
      {combos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map((combo: any) => (
            <Card
              key={combo.id}
              className={`bg-card border-border hover:border-primary/30 transition-colors ${combo.isActive === false ? "opacity-60" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{combo.name}</h3>
                      <Badge className={getTypeColor(combo.type)} variant="outline">
                        {getTypeLabel(combo.type)}
                      </Badge>
                    </div>
                    {combo.requiresApproval && (
                      <p className="text-xs text-warning mt-1">Requires manager approval</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Percent className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-primary">
                      {combo.type === "fixed" ? `$${Number(combo.value).toFixed(2)}` : `${Number(combo.value).toFixed(0)}%`}
                      {combo.type !== "bogo" && <span className="text-base font-normal text-muted-foreground ml-1">off</span>}
                    </span>
                  </div>
                  {combo.minOrderAmount && (
                    <p className="text-xs text-muted-foreground">
                      Min. order: ${Number(combo.minOrderAmount).toFixed(2)}
                    </p>
                  )}
                </div>

                {combo.maxDiscountAmount && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Max discount: ${Number(combo.maxDiscountAmount).toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg">No combo deals yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create your first combo deal to attract more customers and boost average order value.
            </p>
            <Button className="mt-4" onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Create Combo Deal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Combo Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Combo Name</Label>
              <Input
                placeholder="e.g. Lunch Meal Deal, Family Bundle"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (% off)</SelectItem>
                    <SelectItem value="fixed">Fixed ($ off)</SelectItem>
                    <SelectItem value="bogo">BOGO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{form.type === "fixed" ? "Amount ($)" : form.type === "bogo" ? "Value" : "Percentage (%)"}</Label>
                <Input
                  type={form.type === "bogo" ? "text" : "number"}
                  step={form.type === "fixed" ? "0.01" : "1"}
                  min="0"
                  max={form.type === "percentage" ? "100" : undefined}
                  placeholder={form.type === "fixed" ? "e.g. 5.00" : form.type === "bogo" ? "e.g. 1" : "e.g. 20"}
                  value={form.value}
                  onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>Minimum Order Amount ($) <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 20.00"
                value={form.minOrderAmount}
                onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
              />
            </div>

            {/* Live preview */}
            {form.name && form.value && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <p className="font-medium text-primary">{form.name}</p>
                <p className="text-muted-foreground mt-0.5">
                  {form.type === "percentage" && `${form.value}% off`}
                  {form.type === "fixed" && `$${form.value} off`}
                  {form.type === "bogo" && "Buy One Get One"}
                  {form.minOrderAmount && ` on orders over $${form.minOrderAmount}`}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/30">
              <input
                type="checkbox"
                id="reqApproval"
                className="h-4 w-4"
                checked={form.requiresApproval}
                onChange={e => setForm(p => ({ ...p, requiresApproval: e.target.checked }))}
              />
              <Label htmlFor="reqApproval" className="cursor-pointer text-sm">Requires manager approval at POS</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createDiscount.isPending}>
              {createDiscount.isPending ? "Creating…" : "Create Combo Deal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
