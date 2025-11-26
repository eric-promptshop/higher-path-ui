"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MoreHorizontal, Eye, Printer, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "./status-badge"
import type { Order } from "@/lib/admin-store"

interface RecentOrdersTableProps {
  orders: Order[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No orders yet today</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {/* Desktop table */}
      <table className="hidden md:table w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Order
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Customer
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Time
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total
            </th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
              <td className="py-3 px-4">
                <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-primary">
                  #{order.id}
                </Link>
              </td>
              <td className="py-3 px-4 text-muted-foreground">{order.customerName}</td>
              <td className="py-3 px-4 text-muted-foreground">
                {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
              <td className="py-3 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                        <Eye className="w-4 h-4" /> View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Printer className="w-4 h-4" /> Print Slip
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send Update
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link href={`/admin/orders/${order.id}`} className="font-medium text-foreground hover:text-primary">
                  #{order.id}
                </Link>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Print Slip</DropdownMenuItem>
                  <DropdownMenuItem>Send Update</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{order.customerName}</p>
            <div className="flex items-center justify-between">
              <StatusBadge status={order.status} />
              <span className="font-medium">{formatCurrency(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
