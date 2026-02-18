import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SupplierTracking() {
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const performance = trpc.suppliers.getPerformance.useQuery({ supplierId: selectedSupplier || 0 }, { enabled: !!selectedSupplier });
  const scorecard = trpc.suppliers.generateScorecard.useQuery({ supplierId: selectedSupplier || 0 }, { enabled: !!selectedSupplier });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Performance Tracking</h1>
      {scorecard.data && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-gray-600">On-Time Rate</p>
            <p className="text-2xl font-bold">{scorecard.data.onTimeRate}%</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Quality Rating</p>
            <p className="text-2xl font-bold">{scorecard.data.qualityRating}/5</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Avg Price</p>
            <p className="text-2xl font-bold">${scorecard.data.averagePrice}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold">{scorecard.data.totalOrders}</p>
          </Card>
        </div>
      )}
      {performance.data && performance.data.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performance.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="onTimeDeliveries" fill="#f59e0b" />
              <Bar dataKey="lateDeliveries" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
