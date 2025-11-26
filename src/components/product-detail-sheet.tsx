"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore, type Product } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ProductDetailSheetProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailSheet({ product, isOpen, onClose }: ProductDetailSheetProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()

  if (!product) return null

  const isOutOfStock = product.inventory === 0
  const isLowStock = product.inventory > 0 && product.inventory <= 5

  const handleAddToCart = () => {
    if (isOutOfStock) return
    setIsAdding(true)
    addItem(product, quantity)
    setQuantity(1)
    setTimeout(() => {
      setIsAdding(false)
      onClose()
    }, 600)
  }

  const incrementQuantity = () => {
    if (quantity < product.inventory) {
      setQuantity((q) => q + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          {/* Image */}
          <div className="relative aspect-square w-full max-h-[40vh] bg-secondary">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className={cn("object-cover", isOutOfStock && "grayscale")}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
              {isLowStock && !isOutOfStock && <Badge className="bg-warning text-foreground">Low Stock</Badge>}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <SheetHeader className="text-left mb-4">
              <SheetTitle className="text-2xl font-semibold text-foreground">{product.name}</SheetTitle>
              <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
            </SheetHeader>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {!isOutOfStock && (
              <div className="flex items-center gap-2 text-sm text-success mb-6">
                <span className="w-2 h-2 rounded-full bg-success" />
                In Stock ({product.inventory} available)
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex items-center gap-4">
              {!isOutOfStock && (
                <div className="flex items-center border border-border rounded-xl">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-xl"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= product.inventory}
                    className="p-3 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-xl"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                size="lg"
                className={cn("flex-1 h-14 text-base gap-2 transition-all duration-200", isAdding && "scale-95")}
              >
                <ShoppingBag className={cn("h-5 w-5", isAdding && "animate-bounce")} />
                {isOutOfStock ? "Out of Stock" : isAdding ? "Added to Cart!" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
