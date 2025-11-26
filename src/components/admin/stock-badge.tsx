import { cn } from "@/lib/utils"

interface StockBadgeProps {
  inventory: number
  threshold?: number
}

export function StockBadge({ inventory, threshold = 10 }: StockBadgeProps) {
  const status = inventory === 0 ? "out" : inventory <= threshold ? "low" : "in"

  const config = {
    in: { label: "In Stock", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    low: { label: "Low Stock", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
    out: { label: "Out of Stock", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide",
        config[status].className,
      )}
    >
      {config[status].label}
    </span>
  )
}
