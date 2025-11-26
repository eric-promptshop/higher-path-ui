import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/admin-store"

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  packed: { label: "Packed", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  ready: { label: "Ready", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
}

interface StatusBadgeProps {
  status: OrderStatus
  size?: "sm" | "md"
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full uppercase tracking-wide",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}
