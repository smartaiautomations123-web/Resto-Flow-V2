import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Percent, ShoppingCart, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function Profitability() {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  }, []);

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const { data: summary, isLoading: summaryLoading } = trpc.profitability.summary.useQuery({ dateFrom, dateTo });
  const { data: byItem } = trpc.profitability.byItem.useQuery({ dateFrom, dateTo });
  const { data: byCategory } = trpc.profitability.byCategory.useQuery({ dateFrom, dateTo });
  const { data: byShift } = trpc.profitability.byShift.useQuery({ dateFrom, dateTo });
  const { data: topItems } = trpc.profitability.topItems.useQuery({ dateFrom, dateTo, limit: 10 });
  const { data: bottomItems } = trpc.profitability.bottomItems.useQuery({ dateFrom, dateTo, limit: 10 });
  const { data: trends } = trpc.profitability.trends.useQuery({ dateFrom, dateTo });

  const chartDataByCategory = useMemo(() => {
    return byCategory?.map((c) => ({
      name: c.categoryName,
      revenue: c.revenue,
      cogs: c.cogs,
      profit: c.grossProfit,
    })) || [];
  }, [byCategory]);

  const chartDataByShift = useMemo(() => {
    return byShift?.map((s) => ({
      staffId: s.staffId,
      revenue: s.revenue,
      cogs: s.cogs,
      labour: s.labourCost,
      profit: s.netProfit,
    })) || [];
  }, [byShift]);

  const topItemsChart = useMemo(() => {
    return topItems?.map((i) => ({
      name: i.itemName,
      profit: i.grossProfit,
      margin: i.profitMargin,
    })) || [];
  }, [topItems]);

  const bottomItemsChart = useMemo(() => {
    return bottomItems?.map((i) => ({
      name: i.itemName,
      profit: i.grossProfit,
      margin: i.profitMargin,
    })) || [];
  }, [bottomItems]);

  const trendChart = useMemo(() => {
    return trends?.map((t) => ({
      date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: t.revenue,
      profit: t.netProfit,
      margin: t.profitMargin,
    })) || [];
  }, [trends]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profitability Analysis</h1>
        <p className="text-muted-foreground mt-1">Analyze revenue, costs, and profit margins across items, categories, and shifts.</p>
      </div>

      {/* Date Range Filter */}
      <div className="flex gap-4 items-end">
        <div>
          <label className="text-sm font-medium">From</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40 mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">To</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40 mt-1" />
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(summary.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Gross Profit</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(summary.grossProfit)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Profit Margin</p>
                  <p className="text-2xl font-bold mt-2">{formatPercent(summary.profitMargin)}</p>
                </div>
                <Percent className="h-8 w-8 text-info opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">COGS %</p>
                  <p className="text-2xl font-bold mt-2">{formatPercent(summary.cogsPercentage)}</p>
                </div>
                <Package className="h-8 w-8 text-warning opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="shift">By Shift</TabsTrigger>
          <TabsTrigger value="top">Top Items</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* By Category Tab */}
        <TabsContent value="category" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profitability by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {chartDataByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          {/* Category Table */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left py-2 px-4 font-semibold">Category</th>
                      <th className="text-right py-2 px-4 font-semibold">Qty</th>
                      <th className="text-right py-2 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-2 px-4 font-semibold">COGS</th>
                      <th className="text-right py-2 px-4 font-semibold">Profit</th>
                      <th className="text-right py-2 px-4 font-semibold">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCategory?.map((cat) => (
                      <tr key={cat.categoryId} className="border-b border-border/50 hover:bg-accent/30">
                        <td className="py-2 px-4">{cat.categoryName}</td>
                        <td className="text-right py-2 px-4">{cat.quantity}</td>
                        <td className="text-right py-2 px-4 font-semibold">{formatCurrency(cat.revenue)}</td>
                        <td className="text-right py-2 px-4">{formatCurrency(cat.cogs)}</td>
                        <td className="text-right py-2 px-4 font-semibold text-success">{formatCurrency(cat.grossProfit)}</td>
                        <td className="text-right py-2 px-4">
                          <Badge variant={cat.profitMargin >= 30 ? "default" : "secondary"}>{formatPercent(cat.profitMargin)}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Shift Tab */}
        <TabsContent value="shift" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profitability by Shift</CardTitle>
            </CardHeader>
            <CardContent>
              {chartDataByShift.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartDataByShift}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="staffId" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cogs" fill="#ef4444" name="COGS" />
                    <Bar dataKey="labour" fill="#f59e0b" name="Labour" />
                    <Bar dataKey="profit" fill="#10b981" name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Items Tab */}
        <TabsContent value="top" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top 10 Most Profitable Items</CardTitle>
              </CardHeader>
              <CardContent>
                {topItemsChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topItemsChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="profit" fill="#10b981" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top 10 Lowest Profitable Items</CardTitle>
              </CardHeader>
              <CardContent>
                {bottomItemsChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bottomItemsChart} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="profit" fill="#ef4444" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Profit Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {trendChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
                    <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#10b981" name="Net Profit" />
                    <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#f59e0b" name="Margin %" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
