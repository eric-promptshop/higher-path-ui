"use client"

import { useState, useMemo, useEffect } from "react"
import { format, isToday } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { StockBadge } from "@/components/admin/stock-badge"
import { products as demoProducts } from "@/lib/products"
import { useAdminStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Boxes, AlertTriangle, DollarSign, Package, Search, Download, Loader2 } from "lucide-react"
import {
  fetchAdminProducts,
  adjustProductInventory,
  fetchInventoryTransactions,
  type Product as ApiProduct,
  type InventoryTransaction,
} from "@/lib/api"

// Internal product type for the inventory page
interface InventoryProduct {
  id: string
  name: string
  price: number
  category: string
  inventory: number
  image?: string
}

// Map API product to inventory format
function mapApiProduct(apiProduct: ApiProduct): InventoryProduct {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price: parseFloat(apiProduct.basePrice),
    category: apiProduct.category,
    inventory: apiProduct.stockQuantity,
    image: apiProduct.imageUrl || undefined,
  }
}

// Map demo product to inventory format
function mapDemoProduct(demoProduct: typeof demoProducts[0]): InventoryProduct {
  return {
    id: demoProduct.id,
    name: demoProduct.name,
    price: demoProduct.price,
    category: demoProduct.category,
    inventory: demoProduct.inventory,
    image: demoProduct.image,
  }
}

export default function InventoryPage() {
  const { inventoryTransactions: localTransactions, adjustInventory } = useAdminStore()
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [adjustProduct, setAdjustProduct] = useState<InventoryProduct | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustMode, setAdjustMode] = useState<"add" | "remove" | "set">("add")
  const [adjustReason, setAdjustReason] = useState("restock")
  const [isAdjusting, setIsAdjusting] = useState(false)

  // Fetch products from API
  useEffect(() => {
    async function loadData() {
      try {
        const [apiProducts, apiTransactions] = await Promise.all([
          fetchAdminProducts(),
          fetchInventoryTransactions().catch(() => []),
        ])
        setProducts(apiProducts.map(mapApiProduct))
        setTransactions(apiTransactions)
        setIsUsingDemoData(false)
      } catch (err) {
        console.warn("Failed to fetch products from API, using demo data:", err)
        setProducts(demoProducts.map(mapDemoProduct))
        setIsUsingDemoData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(query))
  }, [searchQuery, products])

  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.price * p.inventory, 0)
    const inStock = products.filter((p) => p.inventory > 10).length
    const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 10).length
    const outOfStock = products.filter((p) => p.inventory === 0).length
    return { totalValue, inStock, lowStock, outOfStock }
  }, [products])

  const lowStockProducts = products.filter((p) => p.inventory > 0 && p.inventory <= 10)
  const outOfStockProducts = products.filter((p) => p.inventory === 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const handleAdjust = async () => {
    if (!adjustProduct || !adjustQuantity) return
    const qty = Number.parseInt(adjustQuantity)

    // Calculate the adjustment value
    let adjustment: number
    if (adjustMode === "set") {
      adjustment = qty - adjustProduct.inventory
    } else if (adjustMode === "add") {
      adjustment = qty
    } else {
      adjustment = -qty
    }

    setIsAdjusting(true)

    try {
      if (!isUsingDemoData) {
        // Call the API
        const result = await adjustProductInventory(adjustProduct.id, {
          adjustment,
          reason: adjustReason,
          notes: `${adjustMode === "set" ? "Set to" : adjustMode === "add" ? "Added" : "Removed"} ${qty} units`,
        })

        // Update local state with the new inventory
        setProducts((prev) =>
          prev.map((p) =>
            p.id === adjustProduct.id
              ? { ...p, inventory: result.product.stockQuantity }
              : p
          )
        )

        // Add transaction to the list
        setTransactions((prev) => [result.transaction, ...prev])
      } else {
        // Demo mode - use local store
        adjustInventory(
          adjustProduct.id,
          adjustProduct.name,
          adjustment,
          adjustMode === "set" ? "adjustment" : adjustMode === "add" ? "restock" : "adjustment",
          adjustReason,
          "Ryan",
        )

        // Update local products state for demo
        setProducts((prev) =>
          prev.map((p) =>
            p.id === adjustProduct.id
              ? { ...p, inventory: Math.max(0, p.inventory + adjustment) }
              : p
          )
        )
      }
    } catch (err) {
      console.error("Failed to adjust inventory:", err)
      // Fallback to local adjustment for demo
      adjustInventory(
        adjustProduct.id,
        adjustProduct.name,
        adjustment,
        adjustMode === "set" ? "adjustment" : adjustMode === "add" ? "restock" : "adjustment",
        adjustReason,
        "Ryan",
      )
      setProducts((prev) =>
        prev.map((p) =>
          p.id === adjustProduct.id
            ? { ...p, inventory: Math.max(0, p.inventory + adjustment) }
            : p
        )
      )
    } finally {
      setIsAdjusting(false)
      setAdjustProduct(null)
      setAdjustQuantity("")
    }
  }

  // Combine API transactions with local transactions for display
  const displayTransactions = isUsingDemoData
    ? localTransactions
    : transactions.map((tx) => ({
        id: tx.id,
        productName: tx.productName,
        quantity: tx.quantityChange,
        reason: tx.reason,
        timestamp: tx.createdAt,
      }))

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Inventory" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Inventory" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Demo Mode Banner */}
        {isUsingDemoData && (
          <div className="bg-warning/10 border border-warning/50 rounded-lg p-3 text-sm text-warning">
            Using demo data - API unavailable
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Inventory Value"
            value={formatCurrency(stats.totalValue)}
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Total Products"
            value={products.length}
            subtitle={`${stats.inStock} in stock`}
            icon={Package}
          />
          <MetricCard
            title="Low Stock"
            value={stats.lowStock}
            subtitle="Need attention"
            icon={AlertTriangle}
            variant={stats.lowStock > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Out of Stock"
            value={stats.outOfStock}
            subtitle="Needs restock"
            icon={Boxes}
            variant={stats.outOfStock > 0 ? "warning" : "default"}
          />
        </div>

        {/* Critical Alerts */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Inventory Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {outOfStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">- Out of stock</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdjustProduct(product)
                      setAdjustMode("add")
                      setAdjustQuantity("")
                    }}
                  >
                    Restock
                  </Button>
                </div>
              ))}
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">- {product.inventory} units left</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAdjustProduct(product)
                      setAdjustMode("add")
                      setAdjustQuantity("")
                    }}
                  >
                    Restock
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* All Products */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">All Products</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setAdjustProduct(product)
                      setAdjustMode("add")
                      setAdjustQuantity("")
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                        <span className="text-lg">🌿</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{product.inventory} units</span>
                      <StockBadge inventory={product.inventory} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {displayTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No inventory transactions yet</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {displayTransactions.slice(0, 20).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-start justify-between py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{tx.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.timestamp), isToday(new Date(tx.timestamp)) ? "h:mm a" : "MMM d, h:mm a")}
                          {" · "}
                          {tx.reason}
                        </p>
                      </div>
                      <span className={`text-sm font-medium ${tx.quantity > 0 ? "text-success" : "text-destructive"}`}>
                        {tx.quantity > 0 ? "+" : ""}
                        {tx.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    adjustMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {mode === "add" ? "Add" : mode === "remove" ? "Remove" : "Set To"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select value={adjustReason} onValueChange={setAdjustReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restock">Restock from supplier</SelectItem>
                  <SelectItem value="count">Physical count correction</SelectItem>
                  <SelectItem value="damaged">Damaged/expired units</SelectItem>
                  <SelectItem value="return">Customer return</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            <Button variant="outline" onClick={() => setAdjustProduct(null)} disabled={isAdjusting}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={!adjustQuantity || isAdjusting}>
              {isAdjusting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Inventory"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
