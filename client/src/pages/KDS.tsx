import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { ChefHat, Clock, CheckCircle2, Flame, Timer } from "lucide-react";

function TimerDisplay({ startTime }: { startTime: Date | string | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime]);
  if (!startTime) return null;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLate = mins >= 15;
  return (
    <span className={`text-xs font-mono font-medium ${isLate ? "text-destructive" : mins >= 10 ? "text-warning" : "text-muted-foreground"}`}>
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

const STATIONS = ["all", "grill", "fryer", "salad", "dessert", "bar", "general"] as const;

export default function KDS() {
  const utils = trpc.useUtils();
  const { data: kdsItems, isLoading } = trpc.kds.items.useQuery(undefined, { refetchInterval: 5000 });
  const updateStatus = trpc.kds.updateStatus.useMutation({
    onSuccess: () => utils.kds.items.invalidate(),
  });
  const [station, setStation] = useState<string>("all");

  const filteredItems = useMemo(() => {
    if (!kdsItems) return [];
    if (station === "all") return kdsItems;
    return kdsItems.filter(i => (i.station || "general") === station);
  }, [kdsItems, station]);

  const pendingItems = filteredItems.filter(i => i.status === "pending");
  const preparingItems = filteredItems.filter(i => i.status === "preparing");

  const handleStart = async (id: number) => {
    await updateStatus.mutateAsync({ id, status: "preparing" });
    toast.info("Item started");
  };

  const handleReady = async (id: number) => {
    await updateStatus.mutateAsync({ id, status: "ready" });
    toast.success("Item ready!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" /> Kitchen Display
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {pendingItems.length} pending &middot; {preparingItems.length} preparing
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => utils.kds.items.invalidate()}>Refresh</Button>
      </div>

      {/* Station filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATIONS.map(s => (
          <Button key={s} variant={station === s ? "default" : "outline"} size="sm" onClick={() => setStation(s)} className="capitalize">
            {s}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" /> Pending
            <Badge variant="secondary">{pendingItems.length}</Badge>
          </h2>
          <div className="space-y-3">
            {pendingItems.map(item => (
              <Card key={item.id} className="bg-card border-warning/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{item.station || "general"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{String(item.notes)}</p>}
                      {Array.isArray(item.modifiers) && (item.modifiers as Array<{name: string}>).length > 0 ? (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(item.modifiers as Array<{name: string}>).map((m, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <Button size="sm" onClick={() => handleStart(item.id)}>
                      <Flame className="h-4 w-4 mr-1" /> Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingItems.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No pending items</p>}
          </div>
        </div>

        {/* Preparing */}
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-chart-5" /> Preparing
            <Badge variant="secondary">{preparingItems.length}</Badge>
          </h2>
          <div className="space-y-3">
            {preparingItems.map(item => (
              <Card key={item.id} className="bg-card border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{item.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{item.station || "general"}</Badge>
                        <TimerDisplay startTime={item.sentToKitchenAt} />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      {item.notes && <p className="text-xs text-muted-foreground mt-1 italic">{String(item.notes)}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="border-success text-success hover:bg-success/10" onClick={() => handleReady(item.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Ready
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {preparingItems.length === 0 && <p className="text-muted-foreground text-sm text-center py-8">No items being prepared</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
