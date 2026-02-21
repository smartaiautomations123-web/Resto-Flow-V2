import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, ShoppingCart, Users, Package, AlertCircle, Clock,
  ChefHat, BarChart3, CalendarClock, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, navigate] = useLocation();

  const today = useMemo(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  }, []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }, []);
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  // Today's stats
  const { data: stats } = trpc.reports.salesStats.useQuery({ dateFrom: today, dateTo: tomorrow });
  // Yesterday's stats for comparison
  const { data: yesterdayStats } = trpc.reports.salesStats.useQuery({ dateFrom: yesterday, dateTo: today });
  // Low stock
  const { data: lowStock } = trpc.ingredients.lowStock.useQuery();
  // Recent orders
  const { data: recentOrders } = trpc.orders.list.useQuery({ dateFrom: today });
  // Staff on duty
  const { data: staffOnDuty } = trpc.dashboard.staffOnDuty.useQuery();
  // Shifts ending soon
  const { data: shiftsEndingSoon } = trpc.dashboard.shiftsEndingSoon.useQuery();

  const activeOrders = recentOrders?.filter(o => ["pending", "preparing", "ready"].includes(o.status)) || [];

  // Calculate percentage changes
  const todayRevenue = Number(stats?.totalRevenue || 0);
  const yesterdayRevenue = Number(yesterdayStats?.totalRevenue || 0);
  const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100) : 0;

  const todayOrders = Number(stats?.totalOrders || 0);
  const yesterdayOrders = Number(yesterdayStats?.totalOrders || 0);
  const ordersDiff = todayOrders - yesterdayOrders;

  const lowStockCount = lowStock?.length || 0;
  const staffOnDutyCount = staffOnDuty?.length || 0;
  const shiftsEndingCount = shiftsEndingSoon?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your restaurant operations today.</p>
      </div>

      {/* ─── KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="bg-card border-border hover:border-emerald-500/40 transition-colors">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Today's Revenue</p>
                <p className="text-2xl font-bold">${todayRevenue.toFixed(2)}</p>
                {revenueChange !== 0 && (
                  <p className={`text-xs font-medium flex items-center gap-0.5 ${revenueChange > 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {revenueChange > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {revenueChange > 0 ? "+" : ""}{revenueChange.toFixed(1)}%
                  </p>
                )}
                {revenueChange === 0 && <p className="text-xs text-muted-foreground">No change</p>}
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Today */}
        <Card className="bg-card border-border hover:border-blue-500/40 transition-colors">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Orders Today</p>
                <p className="text-2xl font-bold">{todayOrders}</p>
                <p className={`text-xs font-medium ${ordersDiff >= 0 ? "text-blue-400" : "text-red-400"}`}>
                  {ordersDiff >= 0 ? "+" : ""}{ordersDiff} from yesterday
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff On Duty */}
        <Card className="bg-card border-border hover:border-purple-500/40 transition-colors">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Staff On Duty</p>
                <p className="text-2xl font-bold">{staffOnDutyCount}</p>
                <p className="text-xs text-purple-400 font-medium">
                  {shiftsEndingCount > 0 ? `${shiftsEndingCount} shift${shiftsEndingCount > 1 ? "s" : ""} ending soon` : "All shifts on track"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="bg-card border-border hover:border-orange-500/40 transition-colors">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Low Stock Items</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
                <p className={`text-xs font-medium ${lowStockCount > 0 ? "text-orange-400" : "text-emerald-400"}`}>
                  {lowStockCount > 0 ? "Requires attention" : "All stocked"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-orange-500/15 flex items-center justify-center">
                <Package className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Quick Actions + Alerts Row ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => navigate("/pos")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <ShoppingCart className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">New Order</span>
              </button>
              <button
                onClick={() => navigate("/inventory")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <Package className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Check Inventory</span>
              </button>
              <button
                onClick={() => navigate("/staff")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <CalendarClock className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Staff Schedule</span>
              </button>
              <button
                onClick={() => navigate("/reports")}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <BarChart3 className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">View Reports</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStock && lowStock.length > 0 ? (
                lowStock.slice(0, 3).map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
                    <div className="h-8 w-8 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-orange-300">Low Stock Alert</p>
                      <p className="text-xs text-orange-400/80 mt-0.5">{item.name} inventory below minimum level ({Number(item.currentStock).toFixed(1)} / {Number(item.minStock).toFixed(1)} {item.unit})</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Package className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-300">Stock Healthy</p>
                    <p className="text-xs text-emerald-400/80 mt-0.5">All inventory levels are above minimum thresholds</p>
                  </div>
                </div>
              )}

              {shiftsEndingCount > 0 ? (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-500/8 border border-blue-500/15">
                  <div className="h-8 w-8 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-300">Shift Ending Soon</p>
                    <p className="text-xs text-blue-400/80 mt-0.5">{shiftsEndingCount} staff member{shiftsEndingCount > 1 ? "s" : ""} shift ends in 2 hours</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/40 border border-border">
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">Shifts On Track</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">No shifts ending in the next 2 hours</p>
                  </div>
                </div>
              )}

              {activeOrders.length > 5 && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
                  <div className="h-8 w-8 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ChefHat className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-300">Kitchen Busy</p>
                    <p className="text-xs text-amber-400/80 mt-0.5">{activeOrders.length} active orders in the kitchen queue</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Staff On Duty + Low Stock Items Row ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff On Duty */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Staff On Duty</CardTitle>
              <button onClick={() => navigate("/staff")} className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {staffOnDuty && staffOnDuty.length > 0 ? (
              <div className="space-y-2.5">
                {staffOnDuty.slice(0, 6).map(entry => {
                  const clockedInAt = new Date((entry as any).clockIn);
                  const hoursWorked = ((Date.now() - clockedInAt.getTime()) / (1000 * 60 * 60)).toFixed(1);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-purple-500/15 flex items-center justify-center">
                          <span className="text-sm font-semibold text-purple-400">{(entry as any).staffName?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{(entry as any).staffName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{(entry as any).staffRole}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Clocked in</p>
                        <p className="text-xs font-medium text-purple-400">{hoursWorked}h ago</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No staff currently clocked in</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Low Stock Items</CardTitle>
              <button onClick={() => navigate("/inventory")} className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                View All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-2.5">
                {lowStock.slice(0, 6).map(item => {
                  const stockPercent = Number(item.minStock) > 0 ? Math.min((Number(item.currentStock) / Number(item.minStock)) * 100, 100) : 0;
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${stockPercent < 30 ? "bg-red-500/15" : "bg-orange-500/15"}`}>
                          <Package className={`h-4 w-4 ${stockPercent < 30 ? "text-red-400" : "text-orange-400"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.unit}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${stockPercent < 30 ? "text-red-400" : "text-orange-400"}`}>
                          {Number(item.currentStock).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">Min: {Number(item.minStock).toFixed(1)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">All stock levels are healthy</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Orders ─────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Recent Orders</CardTitle>
            <button onClick={() => navigate("/pos")} className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
              View All
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Order ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">Customer</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3 pr-4">Total</th>
                    <th className="text-right text-xs font-medium text-muted-foreground pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 8).map(order => (
                    <tr key={order.id} className="border-b border-border/30 last:border-0">
                      <td className="py-3 pr-4">
                        <span className="text-sm font-medium">{order.orderNumber}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-muted-foreground capitalize">{order.type.replace("_", " ")}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-muted-foreground">{order.customerName || "Walk-in"}</span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className="text-sm font-medium">${Number(order.total).toFixed(2)}</span>
                      </td>
                      <td className="py-3 text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium border-0 ${order.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                            order.status === "cancelled" ? "bg-red-500/15 text-red-400" :
                              order.status === "preparing" ? "bg-blue-500/15 text-blue-400" :
                                order.status === "ready" ? "bg-amber-500/15 text-amber-400" :
                                  order.status === "served" ? "bg-purple-500/15 text-purple-400" :
                                    "bg-secondary text-muted-foreground"
                            }`}
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <ShoppingCart className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No orders today yet. Start taking orders from the POS.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
