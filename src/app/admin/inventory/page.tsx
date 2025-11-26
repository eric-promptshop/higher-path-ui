"use client"

import { useState, useMemo } from "react"
import { format, isToday } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { StockBadge } from "@/components/admin/stock-badge"
import { products } from "@/lib/products"
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
import { Boxes, AlertTriangle, DollarSign, Package, Search, Download } from "lucide-react"

export default function InventoryPage() {
  const { inventoryTransactions, adjustInventory } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [adjustProduct, setAdjustProduct] = useState<(typeof products)[0] | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustMode, setAdjustMode] = useState<"add" | "remove" | "set">("add")
  const [adjustReason, setAdjustReason] = useState("restock")

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products
    const query = searchQuery.toLowerCase()
    return products.filter((p) => p.name.toLowerCase().includes(query))
  }, [searchQuery])

  const stats = useMemo(() => {
    const totalValue = products.reduce((sum, p) => sum + p.price * p.inventory, 0)
    const inStock = products.filter((p) => p.inventory > 10).length
    const lowStock = products.filter((p) => p.inventory > 0 && p.inventory <= 10).length
    const outOfStock = products.filter((p) => p.inventory === 0).length
    return { totalValue, inStock, lowStock, outOfStock }
  }, [])

  const lowStockProducts = products.filter((p) => p.inventory > 0 && p.inventory <= 10)
  const outOfStockProducts = products.filter((p) => p.inventory === 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const handleAdjust = () => {
    if (!adjustProduct || !adjustQuantity) return
    const qty = Number.parseInt(adjustQuantity)
    adjustInventory(
      adjustProduct.id,
      adjustProduct.name,
      adjustMode === "add" ? qty : adjustMode === "remove" ? -qty : qty,
      adjustMode === "set" ? "adjustment" : adjustMode === "add" ? "restock" : "adjustment",
      adjustReason,
      "Ryan",
    )
    setAdjustProduct(null)
    setAdjustQuantity("")
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Inventory" />

      <main className="p-4 lg:p-6 space-y-6">
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
              {inventoryTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No inventory transactions yet</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {inventoryTransactions.slice(0, 20).map((tx) => (
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
            <Button variant="outline" onClick={() => setAdjustProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleAdjust} disabled={!adjustQuantity}>
              Update Inventory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
