import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, TrendingUp, Users, AlertTriangle, Clock } from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);
  const weekAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  }, []);

  const { data: stats } = trpc.reports.salesStats.useQuery({ dateFrom: today, dateTo: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0] });
  const { data: lowStock } = trpc.ingredients.lowStock.useQuery();
  const { data: recentOrders } = trpc.orders.list.useQuery({ dateFrom: today });
  const { data: dailySales } = trpc.reports.dailySales.useQuery({ dateFrom: weekAgo, dateTo: today });

  const activeOrders = recentOrders?.filter(o => ["pending", "preparing", "ready"].includes(o.status)) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your restaurant operations today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold mt-1">${Number(stats?.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders Today</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Ticket</p>
                <p className="text-2xl font-bold mt-1">${Number(stats?.avgTicket || 0).toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold mt-1">{activeOrders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Orders */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">No active orders right now.</p>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 8).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground capitalize">{order.type.replace("_", " ")} &middot; {order.customerName || "Walk-in"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">${Number(order.total).toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.status === "pending" ? "badge-warning" :
                        order.status === "preparing" ? "badge-info" : "badge-success"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!lowStock || lowStock.length === 0 ? (
              <p className="text-muted-foreground text-sm py-8 text-center">All stock levels are healthy.</p>
            ) : (
              <div className="space-y-3">
                {lowStock.slice(0, 8).map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-destructive">{Number(item.currentStock).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Min: {Number(item.minStock).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sales */}
      {dailySales && dailySales.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Weekly Sales Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {dailySales.map((day, i) => {
                const maxRev = Math.max(...dailySales.map(d => Number(d.revenue)));
                const height = maxRev > 0 ? (Number(day.revenue) / maxRev) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">${Number(day.revenue).toFixed(0)}</span>
                    <div
                      className="w-full rounded-t-md bg-primary/80 transition-all"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("en", { weekday: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
