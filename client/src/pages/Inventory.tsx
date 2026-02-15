import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Pencil, Trash2, Package, AlertTriangle } from "lucide-react";

export default function Inventory() {
  const utils = trpc.useUtils();
  const { data: ingredients } = trpc.ingredients.list.useQuery();
  const { data: lowStock } = trpc.ingredients.lowStock.useQuery();
  const { data: suppliers } = trpc.suppliers.list.useQuery();
  const createIngredient = trpc.ingredients.create.useMutation({ onSuccess: () => { utils.ingredients.list.invalidate(); utils.ingredients.lowStock.invalidate(); } });
  const updateIngredient = trpc.ingredients.update.useMutation({ onSuccess: () => { utils.ingredients.list.invalidate(); utils.ingredients.lowStock.invalidate(); } });
  const deleteIngredient = trpc.ingredients.delete.useMutation({ onSuccess: () => { utils.ingredients.list.invalidate(); utils.ingredients.lowStock.invalidate(); } });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", unit: "kg", currentStock: "", minStock: "", costPerUnit: "", supplierId: "" });

  const openDialog = (item?: any) => {
    setEditItem(item || null);
    setForm({
      name: item?.name || "", unit: item?.unit || "kg",
      currentStock: item?.currentStock || "", minStock: item?.minStock || "",
      costPerUnit: item?.costPerUnit || "", supplierId: item?.supplierId ? String(item.supplierId) : "",
    });
    setShowDialog(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.unit) return;
    const data = {
      name: form.name, unit: form.unit,
      currentStock: form.currentStock || undefined, minStock: form.minStock || undefined,
      costPerUnit: form.costPerUnit || undefined,
      supplierId: form.supplierId ? Number(form.supplierId) : undefined,
    };
    if (editItem) {
      await updateIngredient.mutateAsync({ id: editItem.id, ...data });
      toast.success("Ingredient updated");
    } else {
      await createIngredient.mutateAsync(data);
      toast.success("Ingredient added");
    }
    setShowDialog(false);
  };

  const lowStockIds = new Set(lowStock?.map(i => i.id) || []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">Track ingredients, stock levels, and costs.</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Ingredient
        </Button>
      </div>

      {/* Low stock alert banner */}
      {lowStock && lowStock.length > 0 && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="font-semibold text-destructive">{lowStock.length} items below minimum stock</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.map(item => (
                <Badge key={item.id} variant="outline" className="badge-danger">{item.name}: {Number(item.currentStock).toFixed(1)} {item.unit}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredients table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ingredient</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unit</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Current Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Min Stock</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Cost/Unit</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ingredients?.map(item => {
                  const supplier = suppliers?.find(s => s.id === item.supplierId);
                  const isLow = lowStockIds.has(item.id);
                  return (
                    <tr key={item.id} className={`border-b border-border/50 hover:bg-accent/30 transition-colors ${isLow ? "bg-destructive/5" : ""}`}>
                      <td className="p-4 font-medium text-sm">{item.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{item.unit}</td>
                      <td className="p-4 text-sm font-medium">{Number(item.currentStock).toFixed(2)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{Number(item.minStock).toFixed(2)}</td>
                      <td className="p-4 text-sm">${Number(item.costPerUnit).toFixed(4)}</td>
                      <td className="p-4 text-sm text-muted-foreground">{supplier?.name || "-"}</td>
                      <td className="p-4">
                        <Badge className={isLow ? "badge-danger" : "badge-success"}>
                          {isLow ? "Low" : "OK"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(item)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => {
                            await deleteIngredient.mutateAsync({ id: item.id });
                            toast.success("Deleted");
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!ingredients || ingredients.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No ingredients yet. Click "Add Ingredient" to start.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Add"} Ingredient</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={v => setForm(p => ({ ...p, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["kg", "g", "L", "mL", "pcs", "oz", "lb", "bunch", "can", "bottle"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Cost per Unit ($)</Label><Input type="number" step="0.0001" value={form.costPerUnit} onChange={e => setForm(p => ({ ...p, costPerUnit: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Current Stock</Label><Input type="number" step="0.01" value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: e.target.value }))} /></div>
              <div><Label>Min Stock (alert)</Label><Input type="number" step="0.01" value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: e.target.value }))} /></div>
            </div>
            <div>
              <Label>Supplier</Label>
              <Select value={form.supplierId} onValueChange={v => setForm(p => ({ ...p, supplierId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {suppliers?.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
