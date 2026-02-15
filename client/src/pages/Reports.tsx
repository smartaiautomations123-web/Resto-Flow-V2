import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { BarChart3, DollarSign, TrendingUp, Users, ShoppingCart, PieChart } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return { from: weekAgo.toISOString().split("T")[0], to: now.toISOString().split("T")[0] };
  });

  const stableDateRange = useMemo(() => dateRange, [dateRange.from, dateRange.to]);

  const { data: stats } = trpc.reports.salesStats.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to });
  const { data: dailySales } = trpc.reports.dailySales.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to });
  const { data: topItems } = trpc.reports.topItems.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to, limit: 10 });
  const { data: byCategory } = trpc.reports.salesByCategory.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to });
  const { data: labourCosts } = trpc.reports.labourCosts.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to });
  const { data: byType } = trpc.reports.ordersByType.useQuery({ dateFrom: stableDateRange.from, dateTo: stableDateRange.to });

  const totalLabour = labourCosts?.reduce((s, l) => s + Number(l.totalHours) * Number(l.hourlyRate || 0), 0) || 0;
  const revenue = Number(stats?.totalRevenue || 0);
  const labourPct = revenue > 0 ? ((totalLabour / revenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Sales performance, trends, and labour analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <div><Label className="text-xs">From</Label><Input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} className="w-36" /></div>
          <div><Label className="text-xs">To</Label><Input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} className="w-36" /></div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-1">${revenue.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center"><DollarSign className="h-6 w-6 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats?.totalOrders || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-chart-2/10 flex items-center justify-center"><ShoppingCart className="h-6 w-6 text-chart-2" /></div>
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
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="h-6 w-6 text-success" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Labour Cost %</p>
                <p className="text-2xl font-bold mt-1">{labourPct}%</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center"><Users className="h-6 w-6 text-warning" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
          <TabsTrigger value="items">Top Items</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="channels">By Channel</TabsTrigger>
          <TabsTrigger value="labour">Labour</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Daily Revenue</CardTitle></CardHeader>
            <CardContent>
              {dailySales && dailySales.length > 0 ? (
                <div className="flex items-end gap-1 h-52">
                  {dailySales.map((day, i) => {
                    const maxRev = Math.max(...dailySales.map(d => Number(d.revenue)));
                    const height = maxRev > 0 ? (Number(day.revenue) / maxRev) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">${Number(day.revenue).toFixed(0)}</span>
                        <div className="w-full rounded-t-md bg-primary/80 transition-all hover:bg-primary" style={{ height: `${Math.max(height, 2)}%` }} />
                        <span className="text-xs text-muted-foreground">{new Date(day.date + "T00:00:00").toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No sales data for this period.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Top Selling Items</CardTitle></CardHeader>
            <CardContent>
              {topItems && topItems.length > 0 ? (
                <div className="space-y-3">
                  {topItems.map((item, i) => {
                    const maxQty = Number(topItems[0].totalQty);
                    const pct = maxQty > 0 ? (Number(item.totalQty) / maxQty) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{i + 1}. {item.name}</span>
                          <span className="text-muted-foreground">{item.totalQty} sold &middot; ${Number(item.totalRevenue).toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data available.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Sales by Category</CardTitle></CardHeader>
            <CardContent>
              {byCategory && byCategory.length > 0 ? (
                <div className="space-y-3">
                  {byCategory.map((cat, i) => {
                    const totalCatSales = byCategory.reduce((s, c) => s + Number(c.totalSales), 0);
                    const pct = totalCatSales > 0 ? (Number(cat.totalSales) / totalCatSales) * 100 : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{cat.categoryName}</span>
                          <span className="text-muted-foreground">${Number(cat.totalSales).toFixed(2)} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-chart-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data available.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Orders by Channel</CardTitle></CardHeader>
            <CardContent>
              {byType && byType.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {byType.map((t, i) => (
                    <div key={i} className="p-4 rounded-xl bg-secondary/50 text-center">
                      <p className="text-2xl font-bold">{t.count}</p>
                      <p className="text-sm text-muted-foreground capitalize mt-1">{t.type.replace("_", " ")}</p>
                      <p className="text-sm font-medium text-primary mt-1">${Number(t.revenue).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No data available.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labour" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Labour Costs</CardTitle></CardHeader>
            <CardContent>
              {labourCosts && labourCosts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Staff</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Hours</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Rate</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {labourCosts.map((l, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="p-3 font-medium text-sm">{l.staffName}</td>
                          <td className="p-3 text-sm">{Number(l.totalHours).toFixed(1)}h</td>
                          <td className="p-3 text-sm">${Number(l.hourlyRate || 0).toFixed(2)}/hr</td>
                          <td className="p-3 text-sm font-medium">${(Number(l.totalHours) * Number(l.hourlyRate || 0)).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="font-bold">
                        <td className="p-3">Total</td>
                        <td className="p-3">{labourCosts.reduce((s, l) => s + Number(l.totalHours), 0).toFixed(1)}h</td>
                        <td className="p-3"></td>
                        <td className="p-3 text-primary">${totalLabour.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : <p className="text-muted-foreground text-sm text-center py-12">No labour data available.</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
