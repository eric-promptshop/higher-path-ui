"use client"

import { cn } from "@/lib/utils"
import { ArrowUp, ArrowDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: string
    positive?: boolean
  }
  icon?: LucideIcon
  variant?: "default" | "warning" | "success"
  onClick?: () => void
}

export function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
  variant = "default",
  onClick,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-4 transition-all",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-sm",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
        {Icon && (
          <div
            className={cn(
              "p-2 rounded-lg",
              variant === "warning" && "bg-warning/10 text-warning",
              variant === "success" && "bg-success/10 text-success",
              variant === "default" && "bg-primary/10 text-primary",
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="flex items-center gap-2 mt-2">
          {change && (
            <span
              className={cn(
                "inline-flex items-center text-xs font-medium",
                change.positive ? "text-success" : "text-destructive",
              )}
            >
              {change.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {change.value}
            </span>
          )}
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
