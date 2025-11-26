"use client"

import { useState } from "react"
import Image from "next/image"
import { Minus, Plus, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCartStore, type Product } from "@/lib/store"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  onViewDetails: (product: Product) => void
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addItem } = useCartStore()

  const isOutOfStock = product.inventory === 0
  const isLowStock = product.inventory > 0 && product.inventory <= 5

  const handleAddToCart = () => {
    if (isOutOfStock) return
    setIsAdding(true)
    addItem(product, quantity)
    setQuantity(1)
    setTimeout(() => setIsAdding(false), 600)
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
    <Card
      className={cn("overflow-hidden transition-all duration-200 hover:shadow-lg group", isOutOfStock && "opacity-60")}
    >
      {/* Product Image */}
      <button
        onClick={() => onViewDetails(product)}
        className="relative aspect-square w-full overflow-hidden bg-secondary"
      >
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className={cn(
            "object-cover transition-transform duration-300 group-hover:scale-105",
            isOutOfStock && "grayscale",
          )}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {isLowStock && !isOutOfStock && <Badge className="text-xs bg-warning text-foreground">Low Stock</Badge>}
        </div>
      </button>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        <button onClick={() => onViewDetails(product)} className="text-left w-full">
          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">{product.name}</h3>
        </button>

        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">${product.price.toFixed(2)}</span>
          {!isOutOfStock && (
            <span className="flex items-center gap-1 text-xs text-success">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              In Stock
            </span>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex items-center gap-2 pt-1">
          {!isOutOfStock && (
            <div className="flex items-center border border-border rounded-lg">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-8 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.inventory}
                className="p-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            size="sm"
            className={cn("flex-1 gap-1.5 transition-all duration-200", isAdding && "scale-95")}
          >
            <ShoppingBag className={cn("h-4 w-4", isAdding && "animate-bounce")} />
            <span className="hidden sm:inline">{isAdding ? "Added!" : "Add"}</span>
          </Button>
        </div>
      </div>
    </Card>
  )
}
