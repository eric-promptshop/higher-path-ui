"use client"

import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import type { Activity } from "@/lib/admin-store"

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "order_placed":
        return "bg-primary"
      case "order_updated":
        return "bg-blue-500"
      case "low_stock":
        return "bg-orange-500"
      case "product_added":
        return "bg-green-500"
      case "product_updated":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.slice(0, 8).map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={cn("w-2 h-2 mt-1.5 rounded-full shrink-0", getActivityIcon(activity.type))} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{activity.message}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
