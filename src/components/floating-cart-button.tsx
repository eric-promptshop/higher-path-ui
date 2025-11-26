"use client"

import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/store"
import { cn } from "@/lib/utils"

export function FloatingCartButton() {
  const { toggleCart, getItemCount, getTotal } = useCartStore()
  const itemCount = getItemCount()
  const total = getTotal()

  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Button
        onClick={toggleCart}
        size="lg"
        className={cn("w-full h-14 justify-between px-6 shadow-lg", "animate-in slide-in-from-bottom-4 duration-300")}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary-foreground text-primary text-xs font-bold flex items-center justify-center">
              {itemCount}
            </span>
          </div>
          <span>View Cart</span>
        </div>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </Button>
    </div>
  )
}
