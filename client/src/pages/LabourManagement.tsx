import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, AlertTriangle, Calendar } from "lucide-react";

export default function LabourManagement() {
  const compliance = trpc.labour.getCompliance.useQuery({ locationId: null });
  const overtimeAlerts = trpc.labour.getOvertimeAlerts.useQuery({ staffId: undefined });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Labour Management</h1>

      <Tabs defaultValue="compliance">
        <TabsList>
          <TabsTrigger value="compliance">Compliance Rules</TabsTrigger>
          <TabsTrigger value="overtime">Overtime Alerts</TabsTrigger>
          <TabsTrigger value="availability">Staff Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          {compliance.data && (
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Max Hours/Week</p>
                  <p className="text-2xl font-bold">{compliance.data.maxHoursPerWeek}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min Break Minutes</p>
                  <p className="text-2xl font-bold">{compliance.data.minBreakMinutes}m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overtime Threshold</p>
                  <p className="text-2xl font-bold">{compliance.data.overtimeThreshold}h</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overtime Multiplier</p>
                  <p className="text-2xl font-bold">{compliance.data.overtimeMultiplier}x</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="overtime" className="space-y-4">
          {overtimeAlerts.data?.map((alert: any) => (
            <Card key={alert.id} className="p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mt-1" />
                <div>
                  <p className="font-bold">Overtime Alert</p>
                  <p className="text-sm text-gray-600">Total Hours: {alert.totalHours}h | Overtime: {alert.overtimeHours}h</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="availability">
          <Card className="p-6">
            <p className="text-gray-600">Staff availability calendar coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
