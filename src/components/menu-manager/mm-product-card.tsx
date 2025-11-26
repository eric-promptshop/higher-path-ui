"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { useMenuManagerStore, type MenuProduct } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Settings, Edit2, Copy, Eye, EyeOff, History, Trash2, Package, Star } from "lucide-react"

interface MMProductCardProps {
  product: MenuProduct
  onQuickEdit: (product: MenuProduct) => void
  onViewHistory: (product: MenuProduct) => void
}

export function MMProductCard({ product, onQuickEdit, onViewHistory }: MMProductCardProps) {
  const [stockPopoverOpen, setStockPopoverOpen] = useState(false)
  const [exactStock, setExactStock] = useState("")

  const {
    bulkEditMode,
    selectedProducts,
    toggleProductSelection,
    adjustStock,
    updateProduct,
    duplicateProduct,
    deleteProduct,
    pendingChanges,
  } = useMenuManagerStore()

  const isSelected = selectedProducts.includes(product.id)
  const hasChanges = pendingChanges.some((c) => c.productId === product.id)

  const getStockStatus = () => {
    if (product.inventory === 0) return "out"
    if (product.inventory <= product.lowStockThreshold) return "low"
    return "in"
  }

  const stockStatus = getStockStatus()

  const handleQuickStock = (amount: number, type: "add" | "remove") => {
    adjustStock(product.id, amount, type)
  }

  const handleSetExactStock = () => {
    const value = Number.parseInt(exactStock)
    if (!isNaN(value) && value >= 0) {
      adjustStock(product.id, value, "set")
      setExactStock("")
      setStockPopoverOpen(false)
    }
  }

  const handleToggleActive = () => {
    updateProduct(product.id, { active: !product.active })
  }

  const handleDuplicate = () => {
    duplicateProduct(product.id)
  }

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id)
    }
  }

  return (
    <div
      className={cn(
        "bg-card rounded-xl border transition-all duration-200 overflow-hidden group",
        hasChanges && "ring-2 ring-info ring-offset-2",
        !product.active && "opacity-60",
        isSelected && "ring-2 ring-primary ring-offset-2",
        stockStatus === "low" && "border-warning",
        stockStatus === "out" && "border-destructive",
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {product.image ? (
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-all",
              !product.active && "grayscale",
              stockStatus === "out" && "grayscale",
            )}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Bulk select checkbox */}
        {bulkEditMode && (
          <div className="absolute top-2 left-2 z-10">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleProductSelection(product.id)}
              className="h-5 w-5 bg-background"
            />
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {stockStatus === "out" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-destructive text-destructive-foreground font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground" />
              Out of Stock
            </span>
          ) : stockStatus === "low" ? (
            <span className="text-xs px-2 py-1 rounded-full bg-warning text-white font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Low Stock
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded-full bg-success text-white font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              In Stock
            </span>
          )}
          {hasChanges && (
            <span className="text-xs px-2 py-1 rounded-full bg-info text-white font-medium">Unpublished</span>
          )}
          {!product.active && (
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">Hidden</span>
          )}
        </div>

        {/* Featured badge */}
        {product.featured && (
          <div className="absolute bottom-2 left-2">
            <span className="text-xs px-2 py-1 rounded-full bg-primary text-primary-foreground font-medium flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 space-y-3">
        {/* Product info */}
        <div>
          <h3 className="font-medium text-sm line-clamp-1" title={product.name}>
            {product.name}
          </h3>
          <p className="text-primary font-semibold text-lg">${product.price.toFixed(2)}</p>
        </div>

        {/* Stock control */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Stock:</span>
          <Popover open={stockPopoverOpen} onOpenChange={setStockPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs font-medium bg-transparent">
                {product.inventory} units
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  {[10, 5, 1].map((amt) => (
                    <Button
                      key={`add-${amt}`}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      onClick={() => handleQuickStock(amt, "add")}
                    >
                      +{amt}
                    </Button>
                  ))}
                </div>
                <div className="text-center text-sm font-medium py-1">Current: {product.inventory}</div>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 5, 10].map((amt) => (
                    <Button
                      key={`remove-${amt}`}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-transparent"
                      onClick={() => handleQuickStock(amt, "remove")}
                      disabled={product.inventory < amt}
                    >
                      -{amt}
                    </Button>
                  ))}
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Set to..."
                      value={exactStock}
                      onChange={(e) => setExactStock(e.target.value)}
                      className="h-8 text-xs"
                      min={0}
                    />
                    <Button size="sm" className="h-8 text-xs" onClick={handleSetExactStock}>
                      Set
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Settings dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onQuickEdit(product)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {product.active ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide from Menu
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show on Menu
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewHistory(product)}>
                <History className="h-4 w-4 mr-2" />
                View History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Quick Edit Button */}
        <Button variant="secondary" size="sm" className="w-full h-8 text-xs" onClick={() => onQuickEdit(product)}>
          <Edit2 className="h-3 w-3 mr-1.5" />
          Quick Edit
        </Button>
      </div>
    </div>
  )
}
