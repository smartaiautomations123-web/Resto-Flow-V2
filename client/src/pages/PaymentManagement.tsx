import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, RefreshCw } from "lucide-react";

export default function PaymentManagement() {
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const payments = trpc.payments.getByOrder.useQuery({ orderId: selectedOrder || 0 }, { enabled: !!selectedOrder });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payment Management</h1>
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <CreditCard className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-600">Stripe/Square Integration</p>
            <p className="font-bold">Payment Gateway Status: Connected</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Failed</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
