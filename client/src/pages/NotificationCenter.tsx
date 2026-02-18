import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Archive, Check } from "lucide-react";

export default function NotificationCenter() {
  const { user } = useAuth();
  const notifications = trpc.notifications.getByUser.useQuery({ userId: user?.id || 0 }, { enabled: !!user });
  const markAsRead = trpc.notifications.markAsRead.useMutation({ onSuccess: () => notifications.refetch() });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notification Center</h1>
      <div className="space-y-4">
        {notifications.data?.map((notif: any) => (
          <Card key={notif.id} className="p-4 flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold">{notif.title}</h3>
              <p className="text-sm text-gray-600">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
            </div>
            {!notif.isRead && (
              <Button size="sm" variant="outline" onClick={() => markAsRead.mutate({ id: notif.id })}>
                <Check className="w-4 h-4" />
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
