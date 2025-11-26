"use client"

import { useMemo } from "react"
import { format, subDays, eachDayOfInterval, startOfDay, isWithinInterval } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { useAdminStore } from "@/lib/admin-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, BarChart3 } from "lucide-react"

export default function ReportsPage() {
  const { orders } = useAdminStore()
  const [dateRange, setDateRange] = useState("30")

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

        {/* Quick Links */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Detailed Sales Report</h3>
                <p className="text-sm text-muted-foreground">View full sales breakdown</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Customer Report</h3>
                <p className="text-sm text-muted-foreground">Retention and insights</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Inventory Report</h3>
                <p className="text-sm text-muted-foreground">Stock levels and trends</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
