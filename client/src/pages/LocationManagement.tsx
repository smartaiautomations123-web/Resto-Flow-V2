import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Pencil } from "lucide-react";

export default function LocationManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", email: "", timezone: "UTC" });
  const locations = trpc.locations.getAll.useQuery();
  const createLocation = trpc.locations.create.useMutation({ onSuccess: () => { locations.refetch(); setIsOpen(false); setFormData({ name: "", address: "", phone: "", email: "", timezone: "UTC" }); } });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Location Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Location</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Location</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Location Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              <Input placeholder="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <Input placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <Input placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <Button onClick={() => createLocation.mutate(formData)} disabled={createLocation.isPending}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {locations.data?.map((location: any) => (
          <Card key={location.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-orange-500 mt-1" />
                <div>
                  <h3 className="font-bold text-lg">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  {location.phone && <p className="text-sm text-gray-600">{location.phone}</p>}
                  {location.email && <p className="text-sm text-gray-600">{location.email}</p>}
                </div>
              </div>
              <Button variant="outline" size="sm"><Pencil className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
