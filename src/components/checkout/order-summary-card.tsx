"use client"

import Image from "next/image"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { useCartStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface OrderSummaryCardProps {
  deliveryFee: number
  collapsible?: boolean
}

export function OrderSummaryCard({ deliveryFee, collapsible = false }: OrderSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsible)
  const { items, getTotal } = useCartStore()
  const subtotal = getTotal()
  const total = subtotal + deliveryFee

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
        >
          <div>
            <h3 className="font-medium text-foreground">Order Summary</h3>
            <p className="text-sm text-muted-foreground">{items.length} items</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">${total.toFixed(2)}</span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </button>
      ) : (
        <div className="p-4 border-b border-border">
          <h3 className="font-medium text-foreground">Order Summary</h3>
        </div>
      )}

      <div
        className={cn(
          "transition-all duration-200 overflow-hidden",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {/* Cart Items */}
        <div className="p-4 space-y-3 border-b border-border">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                <Image
                  src={item.product.image || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</h4>
                <p className="text-sm text-muted-foreground">
                  ${item.product.price.toFixed(2)} × {item.quantity}
                </p>
              </div>
              <span className="text-sm font-medium text-foreground">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium text-foreground">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="h-px bg-border my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
