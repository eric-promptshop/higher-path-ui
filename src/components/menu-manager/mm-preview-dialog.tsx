"use client"

import { useState } from "react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Package, Monitor, Smartphone, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MMPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMPreviewDialog({ open, onOpenChange }: MMPreviewDialogProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")
  const { products, categories, pendingChanges } = useMenuManagerStore()

  const activeProducts = products.filter((p) => p.active)
  const sortedCategories = [...categories].filter((c) => c.active).sort((a, b) => a.order - b.order)

  const getProductsForCategory = (categoryName: string) => {
    return activeProducts.filter((p) => p.category === categoryName)
  }

  const getStockStatus = (inventory: number, threshold: number) => {
    if (inventory === 0) return "out"
    if (inventory <= threshold) return "low"
    return "in"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Customer Menu Preview</DialogTitle>
          <DialogDescription>This is exactly what customers will see after publishing</DialogDescription>
        </DialogHeader>

        {/* View toggle */}
        <div className="flex items-center justify-center gap-2 pb-4 border-b">
          <Button
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>

        {/* Preview Container */}
        <div className="flex-1 overflow-hidden">
          <div
            className={cn(
              "mx-auto bg-card border rounded-lg overflow-hidden transition-all",
              viewMode === "mobile" ? "max-w-sm" : "w-full",
            )}
          >
            <ScrollArea className="h-[60vh]">
              {/* Mock Header */}
              <div className="bg-primary p-4 text-primary-foreground">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                    <span className="font-bold text-sm">HP</span>
                  </div>
                  <div>
                    <h1 className="font-semibold">Higher Path Flower</h1>
                    <p className="text-xs opacity-80">Premium Selection</p>
                  </div>
                </div>
              </div>

              {/* Category tabs */}
              <div className="border-b overflow-x-auto">
                <div className="flex px-4 gap-1">
                  {sortedCategories.map((cat, index) => (
                    <button
                      key={cat.id}
                      className={cn(
                        "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors",
                        index === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground",
                      )}
                    >
                      {cat.icon && <span className="mr-1">{cat.icon}</span>}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="p-4">
                {sortedCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No active categories</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedCategories.map((category) => {
                      const catProducts = getProductsForCategory(category.name)
                      if (catProducts.length === 0) return null

                      return (
                        <div key={category.id}>
                          <h2 className="font-semibold mb-3">
                            {category.icon && <span className="mr-2">{category.icon}</span>}
                            {category.name}
                          </h2>
                          <div className={cn("grid gap-3", viewMode === "mobile" ? "grid-cols-2" : "grid-cols-4")}>
                            {catProducts.map((product) => {
                              const status = getStockStatus(product.inventory, product.lowStockThreshold)
                              const hasChange = pendingChanges.some((c) => c.productId === product.id)

                              return (
                                <div
                                  key={product.id}
                                  className={cn(
                                    "bg-background rounded-lg border overflow-hidden",
                                    hasChange && "ring-2 ring-info ring-offset-1",
                                    status === "out" && "opacity-60",
                                  )}
                                >
                                  <div className="aspect-square bg-muted relative">
                                    {product.image ? (
                                      <img
                                        src={product.image || "/placeholder.svg"}
                                        alt={product.name}
                                        className={cn("w-full h-full object-cover", status === "out" && "grayscale")}
                                      />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <Package className="h-8 w-8 text-muted-foreground" />
                                      </div>
                                    )}
                                    {/* Status badge */}
                                    <div className="absolute top-1 right-1">
                                      <span
                                        className={cn(
                                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                                          status === "in" && "bg-success text-white",
                                          status === "low" && "bg-warning text-white",
                                          status === "out" && "bg-destructive text-destructive-foreground",
                                        )}
                                      >
                                        {status === "in" && "In Stock"}
                                        {status === "low" && "Low Stock"}
                                        {status === "out" && "Out"}
                                      </span>
                                    </div>
                                    {hasChange && (
                                      <div className="absolute top-1 left-1">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-info text-white font-medium">
                                          Changed
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-2">
                                    <h3 className="text-xs font-medium line-clamp-1">{product.name}</h3>
                                    <p className="text-sm font-semibold text-primary">${product.price.toFixed(2)}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Unpublished changes summary */}
        {pendingChanges.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Unpublished Changes ({pendingChanges.length}):</p>
            <div className="flex flex-wrap gap-2">
              {pendingChanges.slice(0, 5).map((change) => (
                <div
                  key={change.id}
                  className="inline-flex items-center gap-1 text-xs bg-info/10 text-info px-2 py-1 rounded"
                >
                  <CheckCircle className="h-3 w-3" />
                  {change.productName}
                </div>
              ))}
              {pendingChanges.length > 5 && (
                <span className="text-xs text-muted-foreground">+{pendingChanges.length - 5} more</span>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
