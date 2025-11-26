"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { StockBadge } from "@/components/admin/stock-badge"
import { useMenuManagerStore, type MenuProduct } from "@/lib/menu-manager-store"
import { MMProductGrid } from "@/components/menu-manager/mm-product-grid"
import { MMAddProductDialog } from "@/components/menu-manager/mm-add-product-dialog"
import { MMPublishBar } from "@/components/menu-manager/mm-publish-bar"
import { MMChangesSheet } from "@/components/menu-manager/mm-changes-sheet"
import { MMPreviewDialog } from "@/components/menu-manager/mm-preview-dialog"
import { MMHistoryLog } from "@/components/menu-manager/mm-history-log"
import { MMSettingsSheet } from "@/components/menu-manager/mm-settings-sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Boxes,
  Copy,
  Archive,
  Package,
  LayoutGrid,
  List,
  Eye,
  History,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

type StockFilter = "all" | "in" | "low" | "out"
type ViewMode = "list" | "grid"

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [adjustProduct, setAdjustProduct] = useState<MenuProduct | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustMode, setAdjustMode] = useState<"add" | "remove" | "set">("add")

  // Dialog states
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { products, categories, pendingChanges, adjustStock } = useMenuManagerStore()

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      const category = categories.find((c) => c.id === categoryFilter)
      if (category) {
        filtered = filtered.filter((p) => p.category === category.name)
      }
    }

    // Stock filter
    if (stockFilter === "in") {
      filtered = filtered.filter((p) => p.inventory > 10)
    } else if (stockFilter === "low") {
      filtered = filtered.filter((p) => p.inventory > 0 && p.inventory <= 10)
    } else if (stockFilter === "out") {
      filtered = filtered.filter((p) => p.inventory === 0)
    }

    return filtered
  }, [searchQuery, categoryFilter, stockFilter, products, categories])

  const stockCounts = useMemo(
    () => ({
      all: products.length,
      in: products.filter((p) => p.inventory > 10).length,
      low: products.filter((p) => p.inventory > 0 && p.inventory <= 10).length,
      out: products.filter((p) => p.inventory === 0).length,
    }),
    [products],
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const handleAdjustInventory = () => {
    if (!adjustProduct || !adjustQuantity) return
    adjustStock(adjustProduct.id, Number.parseInt(adjustQuantity), adjustMode)
    setAdjustProduct(null)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Menu Products" />

      <main className="p-4 lg:p-6 space-y-4">
        {/* Top controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <Button variant="outline" size="icon" onClick={() => setShowHistory(true)} title="History">
              <History className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowPreview(true)} title="Preview">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} title="Settings">
              <Settings className="w-4 h-4" />
            </Button>

            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </div>
        </div>

        {/* Stock filter tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {[
            { value: "all" as StockFilter, label: "All Products" },
            { value: "in" as StockFilter, label: "In Stock" },
            { value: "low" as StockFilter, label: "Low Stock" },
            { value: "out" as StockFilter, label: "Out of Stock" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStockFilter(tab.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                stockFilter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {tab.label} ({stockCounts[tab.value]})
            </button>
          ))}
        </div>

        {/* Products - List or Grid View */}
        {viewMode === "list" ? (
          // List View
          <div className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">No products found</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first product to get started"}
                </p>
                <Button onClick={() => setShowAddProduct(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">🌿</span>
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category}
                          {product.featured && <span className="ml-2 text-primary">Featured</span>}
                        </p>
                      </div>
                      <p className="font-medium text-foreground shrink-0">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <StockBadge inventory={product.inventory} />
                      <span className="text-sm text-muted-foreground">{product.inventory} units</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/menu/${product.id}`} className="flex items-center gap-2">
                          <Edit className="w-4 h-4" /> Edit Product
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onClick={() => {
                          setAdjustProduct(product)
                          setAdjustQuantity("")
                          setAdjustMode("add")
                        }}
                      >
                        <Boxes className="w-4 h-4" /> Adjust Inventory
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Copy className="w-4 h-4" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground">
                        <Archive className="w-4 h-4" /> Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
          </div>
        ) : (
          // Grid View
          <MMProductGrid products={filteredProducts} onAddProduct={() => setShowAddProduct(true)} />
        )}

        {/* Publish Bar */}
        {pendingChanges.length > 0 && <MMPublishBar onViewChanges={() => setShowChanges(true)} />}
      </main>

      {/* Inventory Adjustment Dialog */}
      <Dialog open={!!adjustProduct} onOpenChange={(open) => !open && setAdjustProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
            <DialogDescription>
              {adjustProduct?.name} - Current: {adjustProduct?.inventory} units
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              {(["add", "remove", "set"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAdjustMode(mode)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    adjustMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  {mode === "add" ? "Add" : mode === "remove" ? "Remove" : "Set To"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {adjustMode === "add" ? "Units to add" : adjustMode === "remove" ? "Units to remove" : "New quantity"}
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            {adjustQuantity && adjustProduct && (
              <p className="text-sm text-muted-foreground">
                New total:{" "}
                <span className="font-medium text-foreground">
                  {adjustMode === "add"
                    ? adjustProduct.inventory + Number.parseInt(adjustQuantity || "0")
                    : adjustMode === "remove"
                      ? Math.max(0, adjustProduct.inventory - Number.parseInt(adjustQuantity || "0"))
                      : Number.parseInt(adjustQuantity || "0")}{" "}
                  units
                </span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdjustInventory} disabled={!adjustQuantity}>
              Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <MMAddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} />
      <MMChangesSheet open={showChanges} onOpenChange={setShowChanges} onPublish={() => {}} />
      <MMPreviewDialog open={showPreview} onOpenChange={setShowPreview} />
      <MMHistoryLog open={showHistory} onOpenChange={setShowHistory} />
      <MMSettingsSheet open={showSettings} onOpenChange={setShowSettings} />
    </div>
  )
}
