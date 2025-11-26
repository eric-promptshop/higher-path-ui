"use client"

import { useMemo } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { QuickActions } from "@/components/admin/quick-actions"
import { useAdminStore } from "@/lib/admin-store"
import { products } from "@/lib/products"
import { ClipboardList, DollarSign, Clock, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  const { orders, activities, getTodayOrders, getWeekOrders, getOrdersByStatus, getLowStockProducts } = useAdminStore()

  const todayOrders = useMemo(() => getTodayOrders(), [orders])
  const weekOrders = useMemo(() => getWeekOrders(), [orders])
  const pendingOrders = useMemo(() => getOrdersByStatus("pending"), [orders])
  const lowStockProducts = useMemo(() => getLowStockProducts(products), [])

  const weekRevenue = useMemo(() => {
    return weekOrders.reduce((sum, order) => sum + order.total, 0)
  }, [weekOrders])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Orders"
            value={todayOrders.length}
            change={{ value: "+3 from yesterday", positive: true }}
            icon={ClipboardList}
          />
          <MetricCard
            title="This Week"
            value={formatCurrency(weekRevenue)}
            subtitle={`${weekOrders.length} orders`}
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Pending"
            value={pendingOrders.length}
            subtitle={pendingOrders.length > 0 ? `${pendingOrders.length} need action` : "All caught up"}
            icon={Clock}
            variant={pendingOrders.length > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Low Stock"
            value={lowStockProducts.length}
            subtitle={lowStockProducts.length > 0 ? "Items need restock" : "Stock levels OK"}
            icon={AlertTriangle}
            variant={lowStockProducts.length > 0 ? "warning" : "default"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Orders</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders" className="flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
            <RecentOrdersTable orders={orders.slice(0, 5)} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
              <QuickActions pendingCount={pendingOrders.length} />
            </div>

            {/* Activity Feed */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4">Recent Activity</h2>
              <ActivityFeed activities={activities} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
