import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";

export default function ComboBuilder() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ locationId: null, name: "", price: "", regularPrice: "", discount: "" });
  const combos = trpc.combos.getAll.useQuery({ locationId: undefined });
  const createCombo = trpc.combos.create.useMutation({ onSuccess: () => { combos.refetch(); setIsOpen(false); setFormData({ locationId: null, name: "", price: "", regularPrice: "", discount: "" }); } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Combo Builder</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Create Combo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Combo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Combo Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
              <Input placeholder="Regular Price (optional)" type="number" step="0.01" value={formData.regularPrice} onChange={(e) => setFormData({ ...formData, regularPrice: e.target.value })} />
              <Button onClick={() => createCombo.mutate(formData)} disabled={createCombo.isPending}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {combos.data?.map((combo: any) => (
          <Card key={combo.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{combo.name}</h3>
                <p className="text-lg font-semibold text-orange-500">${combo.price}</p>
                {combo.regularPrice && <p className="text-sm text-gray-600 line-through">${combo.regularPrice}</p>}
              </div>
              <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
