"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Printer, Package, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { printOrderSlip } from "./order-print-slip"
import type { Order } from "@/lib/admin-store"

interface QuickActionsProps {
  pendingCount: number
  orders: Order[]
  onMarkReady: () => Promise<void>
}

export function QuickActions({ pendingCount, orders, onMarkReady }: QuickActionsProps) {
  const router = useRouter()
  const [isPrinting, setIsPrinting] = useState(false)
  const [isMarkingReady, setIsMarkingReady] = useState(false)

  const handlePrintSlips = async () => {
    if (orders.length === 0) return
    setIsPrinting(true)

    // Print each order slip with a small delay between them
    for (const order of orders) {
      printOrderSlip({
        id: order.id,
        orderNumber: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryAddress: order.address ? `${order.address.line1}${order.address.line2 ? '\n' + order.address.line2 : ''}\n${order.address.city}, ${order.address.state} ${order.address.zip}` : undefined,
        status: order.status,
        subtotal: order.subtotal.toString(),
        shippingFee: order.deliveryFee?.toString(),
        total: order.total.toString(),
        notes: order.notes,
        substitutionPreference: order.substitutionPreference,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.priceAtTime.toString(),
        })),
      })

      // Small delay between print dialogs
      if (orders.indexOf(order) < orders.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    setIsPrinting(false)
  }

  const handleMarkReady = async () => {
    setIsMarkingReady(true)
    try {
      await onMarkReady()
    } finally {
      setIsMarkingReady(false)
    }
  }

  const handleTodaysReport = () => {
    router.push("/admin/reports?range=today")
  }

  return (
    <div className="space-y-2">
      <Button asChild className="w-full justify-start gap-2">
        <Link href="/admin/orders/new">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-transparent"
        disabled={pendingCount === 0 || isPrinting}
        onClick={handlePrintSlips}
      >
        {isPrinting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Printer className="w-4 h-4" />
        )}
        Print Packing Slips ({pendingCount})
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-transparent"
        disabled={pendingCount === 0 || isMarkingReady}
        onClick={handleMarkReady}
      >
        {isMarkingReady ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Package className="w-4 h-4" />
        )}
        Mark Ready ({pendingCount} orders)
      </Button>
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-transparent"
        onClick={handleTodaysReport}
      >
        <FileText className="w-4 h-4" /> Today&apos;s Report
      </Button>
    </div>
  )
}
