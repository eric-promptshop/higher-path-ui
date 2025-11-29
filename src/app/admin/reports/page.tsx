"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format, subDays, eachDayOfInterval, startOfDay, isWithinInterval, formatDistanceToNow } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { StatusBadge } from "@/components/admin/status-badge"
import { StockBadge } from "@/components/admin/stock-badge"
import { useAdminStore } from "@/lib/admin-store"
import { products as demoProducts } from "@/lib/products"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, BarChart3, ChevronDown, ChevronUp, Package, AlertTriangle } from "lucide-react"

export default function ReportsPage() {
  const { orders } = useAdminStore()
  const searchParams = useSearchParams()
  const initialRange = searchParams.get("range") === "today" ? "1" : "30"
  const [dateRange, setDateRange] = useState(initialRange)
  const [expandedReport, setExpandedReport] = useState<string | null>(null)

  const toggleReport = (report: string) => {
    setExpandedReport(expandedReport === report ? null : report)
  }

  const days = Number.parseInt(dateRange)
  const startDate = subDays(new Date(), days)
  const endDate = new Date()

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => isWithinInterval(new Date(o.createdAt), { start: startDate, end: endDate }))
  }, [orders, startDate, endDate])

  const stats = useMemo(() => {
    const revenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
    const orderCount = filteredOrders.length
    const itemsSold = filteredOrders.reduce((sum, o) => o.items.reduce((s, i) => s + i.quantity, 0) + sum, 0)
    const uniqueCustomers = new Set(filteredOrders.map((o) => o.customerId)).size
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0
    const newCustomers = uniqueCustomers // Simplified for demo

    return { revenue, orderCount, itemsSold, uniqueCustomers, avgOrderValue, newCustomers }
  }, [filteredOrders])

  // Daily revenue data for chart
  const dailyData = useMemo(() => {
    const interval = eachDayOfInterval({ start: startDate, end: endDate })
    return interval.map((date) => {
      const dayOrders = filteredOrders.filter(
        (o) => startOfDay(new Date(o.createdAt)).getTime() === startOfDay(date).getTime(),
      )
      return {
        date,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      }
    })
  }, [filteredOrders, startDate, endDate])

  // Top products
  const topProducts = useMemo(() => {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>()

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.product.id)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.quantity * item.priceAtTime
        } else {
          productSales.set(item.product.id, {
            name: item.product.name,
            quantity: item.quantity,
            revenue: item.quantity * item.priceAtTime,
          })
        }
      })
    })

    return Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [filteredOrders])

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories = new Map<string, number>()

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const current = categories.get(item.product.category) || 0
        categories.set(item.product.category, current + item.quantity * item.priceAtTime)
      })
    })

    const total = Array.from(categories.values()).reduce((sum, v) => sum + v, 0)
    return Array.from(categories.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredOrders])

  // Customer data aggregation
  const customerData = useMemo(() => {
    const customers = new Map<string, {
      id: string
      name: string
      phone: string
      orders: number
      totalSpent: number
      lastOrder: Date
    }>()

    filteredOrders.forEach((order) => {
      const existing = customers.get(order.customerId)
      if (existing) {
        existing.orders += 1
        existing.totalSpent += order.total
        if (new Date(order.createdAt) > existing.lastOrder) {
          existing.lastOrder = new Date(order.createdAt)
        }
      } else {
        customers.set(order.customerId, {
          id: order.customerId,
          name: order.customerName,
          phone: order.customerPhone,
          orders: 1,
          totalSpent: order.total,
          lastOrder: new Date(order.createdAt),
        })
      }
    })

    return Array.from(customers.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }, [filteredOrders])

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const methods = new Map<string, { count: number; revenue: number }>()

    filteredOrders.forEach((order) => {
      // Default to "cash" if no deliveryMethod (using deliveryMethod as proxy for demo)
      const method = order.deliveryMethod === "express" ? "Express" : "Standard"
      const existing = methods.get(method) || { count: 0, revenue: 0 }
      existing.count += 1
      existing.revenue += order.total
      methods.set(method, existing)
    })

    const total = filteredOrders.length
    return Array.from(methods.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredOrders])

  // Inventory data
  const inventoryData = useMemo(() => {
    return demoProducts.map(product => ({
      ...product,
      stockValue: product.price * product.inventory,
    })).sort((a, b) => a.inventory - b.inventory)
  }, [])

  const inventoryStats = useMemo(() => {
    const totalValue = inventoryData.reduce((sum, p) => sum + p.stockValue, 0)
    const lowStock = inventoryData.filter(p => p.inventory > 0 && p.inventory <= 10).length
    const outOfStock = inventoryData.filter(p => p.inventory === 0).length
    return { totalValue, lowStock, outOfStock, totalProducts: inventoryData.length }
  }, [inventoryData])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1)

  return (
    <div className="min-h-screen">
      <AdminHeader title="Reports" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Revenue" value={formatCurrency(stats.revenue)} icon={DollarSign} variant="success" />
          <MetricCard
            title="Orders"
            value={stats.orderCount}
            subtitle={`${stats.itemsSold} items sold`}
            icon={ShoppingCart}
          />
          <MetricCard title="Avg Order Value" value={formatCurrency(stats.avgOrderValue)} icon={TrendingUp} />
          <MetricCard
            title="Customers"
            value={stats.uniqueCustomers}
            subtitle={`${stats.newCustomers} new`}
            icon={Users}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {dailyData.slice(-14).map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                      style={{
                        height: `${Math.max((day.revenue / maxRevenue) * 100, 2)}%`,
                        minHeight: day.revenue > 0 ? "8px" : "2px",
                      }}
                      title={`${format(day.date, "MMM d")}: ${formatCurrency(day.revenue)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{format(dailyData[Math.max(0, dailyData.length - 14)]?.date || new Date(), "MMM d")}</span>
                <span>{format(dailyData[dailyData.length - 1]?.date || new Date(), "MMM d")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  No sales data for this period
                </div>
              ) : (
                <div className="space-y-4">
                  {categoryData.map((cat, i) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">{cat.name}</span>
                        <span className="text-muted-foreground">
                          {cat.percentage}% ({formatCurrency(cat.value)})
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No sales data for this period</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Rank
                      </th>
                      <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Product
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Units Sold
                      </th>
                      <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, i) => (
                      <tr key={product.name} className="border-b border-border last:border-0">
                        <td className="py-3 px-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-3 px-2 font-medium">{product.name}</td>
                        <td className="py-3 px-2 text-right">{product.quantity}</td>
                        <td className="py-3 px-2 text-right font-medium">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Reports - Expandable Sections */}
        <div className="space-y-4">
          {/* Detailed Sales Report */}
          <Collapsible open={expandedReport === "sales"} onOpenChange={() => toggleReport("sales")}>
            <CollapsibleTrigger asChild>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="py-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Detailed Sales Report</h3>
                    <p className="text-sm text-muted-foreground">View full sales breakdown</p>
                  </div>
                  {expandedReport === "sales" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2 border-primary/20">
                <CardContent className="pt-6">
                  {/* Delivery Method Breakdown */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-3">Delivery Method Breakdown</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {paymentMethodData.map((method) => (
                        <div key={method.name} className="bg-secondary/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">{method.name}</p>
                          <p className="text-2xl font-bold">{method.count}</p>
                          <p className="text-xs text-muted-foreground">
                            {method.percentage}% • {formatCurrency(method.revenue)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All Orders Table */}
                  <h4 className="text-sm font-medium mb-3">All Orders in Period</h4>
                  {filteredOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No orders in this period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Order</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</th>
                            <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Items</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivery</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOrders.slice(0, 20).map((order) => (
                            <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="py-3 px-2">
                                <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline font-mono text-sm">
                                  #{order.id.slice(0, 8)}
                                </Link>
                              </td>
                              <td className="py-3 px-2 text-sm">{format(new Date(order.createdAt), "MMM d, h:mm a")}</td>
                              <td className="py-3 px-2 text-sm font-medium">{order.customerName}</td>
                              <td className="py-3 px-2 text-center text-sm">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
                              <td className="py-3 px-2 text-sm capitalize">{order.deliveryMethod}</td>
                              <td className="py-3 px-2"><StatusBadge status={order.status} /></td>
                              <td className="py-3 px-2 text-right font-medium">{formatCurrency(order.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredOrders.length > 20 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Showing 20 of {filteredOrders.length} orders.{" "}
                          <Link href="/admin/orders" className="text-primary hover:underline">View all orders</Link>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Customer Report */}
          <Collapsible open={expandedReport === "customers"} onOpenChange={() => toggleReport("customers")}>
            <CollapsibleTrigger asChild>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="py-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Customer Report</h3>
                    <p className="text-sm text-muted-foreground">Retention and insights</p>
                  </div>
                  {expandedReport === "customers" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2 border-primary/20">
                <CardContent className="pt-6">
                  {/* Customer Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Customers</p>
                      <p className="text-2xl font-bold">{customerData.length}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Avg Orders/Customer</p>
                      <p className="text-2xl font-bold">
                        {customerData.length > 0
                          ? (filteredOrders.length / customerData.length).toFixed(1)
                          : "0"}
                      </p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Avg Lifetime Value</p>
                      <p className="text-2xl font-bold">
                        {customerData.length > 0
                          ? formatCurrency(customerData.reduce((sum, c) => sum + c.totalSpent, 0) / customerData.length)
                          : "$0"}
                      </p>
                    </div>
                  </div>

                  {/* Top Customers Table */}
                  <h4 className="text-sm font-medium mb-3">Top Customers by Spending</h4>
                  {customerData.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No customer data in this period</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</th>
                            <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact</th>
                            <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Orders</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Spent</th>
                            <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Order</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customerData.slice(0, 10).map((customer) => (
                            <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                              <td className="py-3 px-2 font-medium">{customer.name}</td>
                              <td className="py-3 px-2 text-sm text-muted-foreground">{customer.phone || "—"}</td>
                              <td className="py-3 px-2 text-center">{customer.orders}</td>
                              <td className="py-3 px-2 text-right font-medium">{formatCurrency(customer.totalSpent)}</td>
                              <td className="py-3 px-2 text-right text-sm text-muted-foreground">
                                {formatDistanceToNow(customer.lastOrder, { addSuffix: true })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {customerData.length > 10 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          Showing top 10 of {customerData.length} customers.{" "}
                          <Link href="/admin/customers" className="text-primary hover:underline">View all customers</Link>
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Inventory Report */}
          <Collapsible open={expandedReport === "inventory"} onOpenChange={() => toggleReport("inventory")}>
            <CollapsibleTrigger asChild>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="py-6 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Inventory Report</h3>
                    <p className="text-sm text-muted-foreground">Stock levels and trends</p>
                  </div>
                  {expandedReport === "inventory" ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </CardContent>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-2 border-primary/20">
                <CardContent className="pt-6">
                  {/* Inventory Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{inventoryStats.totalProducts}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Inventory Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</p>
                    </div>
                    <div className="bg-orange-500/10 rounded-lg p-4">
                      <p className="text-sm text-orange-600">Low Stock</p>
                      <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStock}</p>
                    </div>
                    <div className="bg-red-500/10 rounded-lg p-4">
                      <p className="text-sm text-red-600">Out of Stock</p>
                      <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
                    </div>
                  </div>

                  {/* Low Stock Alerts */}
                  {(inventoryStats.lowStock > 0 || inventoryStats.outOfStock > 0) && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Stock Alerts
                      </h4>
                      <div className="space-y-2">
                        {inventoryData
                          .filter(p => p.inventory <= 10)
                          .map((product) => (
                            <div
                              key={product.id}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                product.inventory === 0 ? "bg-red-500/10" : "bg-orange-500/10"
                              }`}
                            >
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                              </div>
                              <div className="text-right">
                                <StockBadge inventory={product.inventory} />
                                <p className="text-sm text-muted-foreground mt-1">{product.inventory} units</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Full Inventory Table */}
                  <h4 className="text-sm font-medium mb-3">Full Inventory</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Product</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</th>
                          <th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock</th>
                          <th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                          <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Price</th>
                          <th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.map((product) => (
                          <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="py-3 px-2 font-medium">{product.name}</td>
                            <td className="py-3 px-2 text-sm text-muted-foreground">{product.category}</td>
                            <td className="py-3 px-2 text-center">{product.inventory}</td>
                            <td className="py-3 px-2"><StockBadge inventory={product.inventory} /></td>
                            <td className="py-3 px-2 text-right">{formatCurrency(product.price)}</td>
                            <td className="py-3 px-2 text-right font-medium">{formatCurrency(product.stockValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-center text-sm text-muted-foreground py-4">
                    <Link href="/admin/inventory" className="text-primary hover:underline">Manage inventory</Link>
                  </p>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>
    </div>
  )
}
