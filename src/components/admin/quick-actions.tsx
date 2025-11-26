"use client"

import Link from "next/link"
import { Plus, Printer, Package, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuickActionsProps {
  pendingCount: number
}

export function QuickActions({ pendingCount }: QuickActionsProps) {
  return (
    <div className="space-y-2">
      <Button asChild className="w-full justify-start gap-2">
        <Link href="/admin/orders/new">
          <Plus className="w-4 h-4" /> New Order
        </Link>
      </Button>
      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" disabled={pendingCount === 0}>
        <Printer className="w-4 h-4" /> Print Packing Slips ({pendingCount})
      </Button>
      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" disabled={pendingCount === 0}>
        <Package className="w-4 h-4" /> Mark Ready ({pendingCount} orders)
      </Button>
      <Button variant="outline" className="w-full justify-start gap-2 bg-transparent">
        <FileText className="w-4 h-4" /> Today&apos;s Report
      </Button>
    </div>
  )
}
