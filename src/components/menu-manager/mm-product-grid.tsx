"use client"

import { useState } from "react"
import { useMenuManagerStore, type MenuProduct } from "@/lib/menu-manager-store"
import { MMProductCard } from "./mm-product-card"
import { MMQuickEditSheet } from "./mm-quick-edit-sheet"
import { MMHistorySheet } from "./mm-history-sheet"
import { Button } from "@/components/ui/button"
import { Package, Plus, CheckSquare, Square, Trash2, DollarSign, Layers } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MMProductGridProps {
  products: MenuProduct[]
  onAddProduct: () => void
}

export function MMProductGrid({ products, onAddProduct }: MMProductGridProps) {
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null)
  const [viewingHistory, setViewingHistory] = useState<MenuProduct | null>(null)

  const { bulkEditMode, selectedProducts, selectAllProducts, clearSelection, bulkSetActive, bulkDelete } =
    useMenuManagerStore()

  const handleQuickEdit = (product: MenuProduct) => {
    setEditingProduct(product)
  }

  const handleViewHistory = (product: MenuProduct) => {
    setViewingHistory(product)
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No products yet</h3>
        <p className="text-muted-foreground mb-4">Add your first product to get started</p>
        <Button onClick={onAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Bulk Edit Bar */}
      {bulkEditMode && (
        <div className="bg-muted/50 border border-border rounded-lg p-3 mb-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Button variant="outline" size="sm" onClick={selectAllProducts}>
              <CheckSquare className="h-4 w-4 mr-1.5" />
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>
              <Square className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          </div>

          {selectedProducts.length > 0 && (
            <>
              <span className="text-sm text-muted-foreground">{selectedProducts.length} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Layers className="h-4 w-4 mr-1.5" />
                      Update Stock
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Add 10 to all</DropdownMenuItem>
                    <DropdownMenuItem>Add 5 to all</DropdownMenuItem>
                    <DropdownMenuItem>Set to 0 (Out of Stock)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <DollarSign className="h-4 w-4 mr-1.5" />
                      Update Price
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Increase by 5%</DropdownMenuItem>
                    <DropdownMenuItem>Decrease by 5%</DropdownMenuItem>
                    <DropdownMenuItem>Increase by $1</DropdownMenuItem>
                    <DropdownMenuItem>Decrease by $1</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={() => bulkSetActive(true)}>
                  Set Active
                </Button>
                <Button variant="outline" size="sm" onClick={() => bulkSetActive(false)}>
                  Set Inactive
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
                      bulkDelete()
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <MMProductCard
            key={product.id}
            product={product}
            onQuickEdit={handleQuickEdit}
            onViewHistory={handleViewHistory}
          />
        ))}

        {/* Add New Card */}
        <button
          onClick={onAddProduct}
          className="aspect-[4/5] bg-muted/50 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2"
        >
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Add New</span>
        </button>
      </div>

      {/* Quick Edit Sheet */}
      <MMQuickEditSheet
        product={editingProduct}
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      />

      {/* History Sheet */}
      <MMHistorySheet
        product={viewingHistory}
        open={!!viewingHistory}
        onOpenChange={(open) => !open && setViewingHistory(null)}
      />
    </>
  )
}
