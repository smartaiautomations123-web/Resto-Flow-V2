import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Pencil, Trash2, Truck, FileText, Send } from "lucide-react";

export default function Suppliers() {
  const utils = trpc.useUtils();
  const { data: suppliersList } = trpc.suppliers.list.useQuery();
  const { data: purchaseOrdersList } = trpc.purchaseOrders.list.useQuery();
  const { data: ingredients } = trpc.ingredients.list.useQuery();
  const createSupplier = trpc.suppliers.create.useMutation({ onSuccess: () => utils.suppliers.list.invalidate() });
  const updateSupplier = trpc.suppliers.update.useMutation({ onSuccess: () => utils.suppliers.list.invalidate() });
  const deleteSupplier = trpc.suppliers.delete.useMutation({ onSuccess: () => utils.suppliers.list.invalidate() });
  const createPO = trpc.purchaseOrders.create.useMutation({ onSuccess: () => utils.purchaseOrders.list.invalidate() });
  const updatePO = trpc.purchaseOrders.update.useMutation({ onSuccess: () => utils.purchaseOrders.list.invalidate() });

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", contactName: "", email: "", phone: "", address: "", notes: "" });
  const [showPODialog, setShowPODialog] = useState(false);
  const [poForm, setPoForm] = useState({ supplierId: "", items: [{ ingredientId: "", quantity: "", unitCost: "" }] as { ingredientId: string; quantity: string; unitCost: string }[], notes: "" });

  const openDialog = (item?: any) => {
    setEditItem(item || null);
    setForm({
      name: item?.name || "", contactName: item?.contactName || "",
      email: item?.email || "", phone: item?.phone || "",
      address: item?.address || "", notes: item?.notes || "",
    });
    setShowDialog(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    if (editItem) {
      await updateSupplier.mutateAsync({ id: editItem.id, ...form });
      toast.success("Supplier updated");
    } else {
      await createSupplier.mutateAsync(form);
      toast.success("Supplier added");
    }
    setShowDialog(false);
  };

  const savePO = async () => {
    if (!poForm.supplierId) return;
    const validItems = poForm.items.filter(i => i.ingredientId && i.quantity && i.unitCost);
    if (validItems.length === 0) { toast.error("Add at least one item"); return; }
    await createPO.mutateAsync({
      supplierId: Number(poForm.supplierId),
      notes: poForm.notes || undefined,
      items: validItems.map(i => ({
        ingredientId: Number(i.ingredientId), quantity: i.quantity, unitCost: i.unitCost,
        totalCost: (Number(i.quantity) * Number(i.unitCost)).toFixed(2),
      })),
    });
    toast.success("Purchase order created");
    setShowPODialog(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Manage suppliers and purchase orders.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setPoForm({ supplierId: suppliersList?.[0]?.id ? String(suppliersList[0].id) : "", items: [{ ingredientId: "", quantity: "", unitCost: "" }], notes: "" }); setShowPODialog(true); }}>
            <FileText className="h-4 w-4 mr-2" /> New Purchase Order
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers"><Truck className="h-4 w-4 mr-1" /> Suppliers</TabsTrigger>
          <TabsTrigger value="orders"><FileText className="h-4 w-4 mr-1" /> Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="suppliers" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliersList?.map(s => (
              <Card key={s.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      {s.contactName && <p className="text-sm text-muted-foreground mt-1">{s.contactName}</p>}
                      {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                      {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => { await deleteSupplier.mutateAsync({ id: s.id }); toast.success("Deleted"); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  {s.address && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{s.address}</p>}
                </CardContent>
              </Card>
            ))}
            {(!suppliersList || suppliersList.length === 0) && <p className="text-muted-foreground text-sm col-span-full text-center py-8">No suppliers yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">PO #</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Supplier</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrdersList?.map(po => {
                    const supplier = suppliersList?.find(s => s.id === po.supplierId);
                    return (
                      <tr key={po.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="p-4 font-medium text-sm">PO-{po.id}</td>
                        <td className="p-4 text-sm">{supplier?.name || "-"}</td>
                        <td className="p-4 text-sm font-medium">${Number(po.totalAmount).toFixed(2)}</td>
                        <td className="p-4">
                          <Badge className={
                            po.status === "received" ? "badge-success" :
                            po.status === "sent" ? "badge-info" :
                            po.status === "cancelled" ? "badge-danger" : "badge-warning"
                          }>{po.status}</Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{new Date(po.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          {po.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={async () => { await updatePO.mutateAsync({ id: po.id, status: "sent" }); toast.success("PO sent"); }}>
                              <Send className="h-3 w-3 mr-1" /> Send
                            </Button>
                          )}
                          {po.status === "sent" && (
                            <Button size="sm" variant="outline" onClick={async () => { await updatePO.mutateAsync({ id: po.id, status: "received" }); toast.success("PO received"); }}>
                              Receive
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(!purchaseOrdersList || purchaseOrdersList.length === 0) && <p className="text-muted-foreground text-sm text-center py-8">No purchase orders yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit" : "Add"} Supplier</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Company Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Address</Label><Textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PO Dialog */}
      <Dialog open={showPODialog} onOpenChange={setShowPODialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label>Supplier</Label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={poForm.supplierId} onChange={e => setPoForm(p => ({ ...p, supplierId: e.target.value }))}>
                <option value="">Select supplier</option>
                {suppliersList?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {poForm.items.map((item, i) => (
              <div key={i} className="grid grid-cols-3 gap-2">
                <select className="rounded-md border border-input bg-background px-2 py-2 text-sm" value={item.ingredientId} onChange={e => { const items = [...poForm.items]; items[i] = { ...items[i], ingredientId: e.target.value }; setPoForm(p => ({ ...p, items })); }}>
                  <option value="">Ingredient</option>
                  {ingredients?.map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                </select>
                <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => { const items = [...poForm.items]; items[i] = { ...items[i], quantity: e.target.value }; setPoForm(p => ({ ...p, items })); }} />
                <Input placeholder="Unit cost" type="number" step="0.01" value={item.unitCost} onChange={e => { const items = [...poForm.items]; items[i] = { ...items[i], unitCost: e.target.value }; setPoForm(p => ({ ...p, items })); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setPoForm(p => ({ ...p, items: [...p.items, { ingredientId: "", quantity: "", unitCost: "" }] }))}>
              <Plus className="h-3 w-3 mr-1" /> Add Line
            </Button>
            <div><Label>Notes</Label><Textarea value={poForm.notes} onChange={e => setPoForm(p => ({ ...p, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button onClick={savePO}>Create Order</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
