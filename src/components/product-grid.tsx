"use client"

import { Package } from "lucide-react"
import { ProductCard } from "./product-card"
import type { Product } from "@/lib/store"

interface ProductGridProps {
  products: Product[]
  onViewDetails: (product: Product) => void
  isLoading?: boolean
}

function ProductSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-secondary rounded w-3/4" />
        <div className="h-5 bg-secondary rounded w-1/3" />
        <div className="h-9 bg-secondary rounded" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, onViewDetails, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">No products found</h3>
        <p className="text-sm text-muted-foreground">Try adjusting your search or browse all products</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onViewDetails={onViewDetails} />
      ))}
    </div>
  )
}
