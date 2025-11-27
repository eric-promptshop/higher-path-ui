"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import { MetricCard } from "@/components/admin/metric-card"
import { RecentOrdersTable } from "@/components/admin/recent-orders-table"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { QuickActions } from "@/components/admin/quick-actions"
import { useAdminStore, type Order } from "@/lib/admin-store"
import { products as demoProducts } from "@/lib/products"
import { ClipboardList, DollarSign, Clock, AlertTriangle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchDashboardStats, fetchAdminOrders, fetchAdminProducts, type DashboardStats, type AdminOrderWithDetails } from "@/lib/api"

export default function AdminDashboardPage() {
  const { orders: localOrders, activities, getTodayOrders, getWeekOrders, getOrdersByStatus, getLowStockProducts } = useAdminStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<AdminOrderWithDetails[]>([])
  const [lowStockCount, setLowStockCount] = useState(0)

  // Fetch dashboard data from API
  useEffect(() => {
    async function loadDashboard() {
      try {
        const [dashboardStats, ordersData, productsData] = await Promise.all([
          fetchDashboardStats().catch(() => null),
          fetchAdminOrders({ limit: 5 }).catch(() => null),
          fetchAdminProducts().catch(() => []),
        ])

        if (dashboardStats) {
          setStats(dashboardStats)
          setIsUsingDemoData(false)
        } else {
          setIsUsingDemoData(true)
        }

        if (ordersData) {
          setRecentOrders(ordersData.orders)
        }

        // Count low stock products from API
        const lowStock = productsData.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 10).length
        setLowStockCount(lowStock)
      } catch (err) {
        console.warn("Failed to fetch dashboard data, using demo data:", err)
        setIsUsingDemoData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadDashboard()
  }, [])

  // Demo data fallbacks
  const todayOrders = useMemo(() => getTodayOrders(), [localOrders, getTodayOrders])
  const weekOrders = useMemo(() => getWeekOrders(), [localOrders, getWeekOrders])
  const pendingOrders = useMemo(() => getOrdersByStatus("pending"), [localOrders, getOrdersByStatus])
  const demoLowStockProducts = useMemo(() => getLowStockProducts(demoProducts), [getLowStockProducts])

  const weekRevenue = useMemo(() => {
    return weekOrders.reduce((sum, order) => sum + order.total, 0)
  }, [weekOrders])

  // Use API stats if available, otherwise fallback to demo
  const displayStats = {
    todayOrders: stats?.totalOrders ?? todayOrders.length,
    weekRevenue: stats?.totalRevenue ?? weekRevenue,
    weekOrderCount: stats ? Math.round(stats.totalRevenue / (stats.averageOrderValue || 1)) : weekOrders.length,
    pendingOrders: stats?.pendingOrders ?? pendingOrders.length,
    lowStockCount: isUsingDemoData ? demoLowStockProducts.length : lowStockCount,
  }

  // Map recent orders for display - must match Order type from admin-store
  const displayOrders: Order[] = recentOrders.length > 0
    ? recentOrders.map(order => ({
        id: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone || "",
        subtotal: parseFloat(order.subtotal),
        deliveryFee: 0,
        total: parseFloat(order.total),
        status: order.status as "pending" | "confirmed" | "packed" | "ready" | "completed" | "cancelled",
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        items: order.items?.map(item => ({
          product: { id: item.productId, name: item.productName, price: parseFloat(item.unitPrice), description: "", image: "", category: "", inventory: 0, featured: false },
          quantity: item.quantity,
          priceAtTime: parseFloat(item.unitPrice),
        })) || [],
        deliveryMethod: "standard" as const,
        address: { line1: order.deliveryAddress || "", city: "", state: "", zip: "" },
        notes: order.notes || "",
        substitutionPreference: (order.substitutionPreference as "allow" | "contact" | "cancel") || "contact",
        statusHistory: order.statusHistory?.map(h => ({
          status: h.status as "pending" | "confirmed" | "packed" | "ready" | "completed" | "cancelled",
          timestamp: new Date(h.createdAt),
          by: h.changedBy || "System",
        })) || [],
        internalNotes: [],
      }))
    : localOrders.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Dashboard" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Dashboard" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Demo Mode Banner */}
        {isUsingDemoData && (
          <div className="bg-warning/10 border border-warning/50 rounded-lg p-3 text-sm text-warning">
            Using demo data - API unavailable
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Orders"
            value={displayStats.todayOrders}
            change={{ value: "+3 from yesterday", positive: true }}
            icon={ClipboardList}
          />
          <MetricCard
            title="This Week"
            value={formatCurrency(displayStats.weekRevenue)}
            subtitle={`${displayStats.weekOrderCount} orders`}
            icon={DollarSign}
            variant="success"
          />
          <MetricCard
            title="Pending"
            value={displayStats.pendingOrders}
            subtitle={displayStats.pendingOrders > 0 ? `${displayStats.pendingOrders} need action` : "All caught up"}
            icon={Clock}
            variant={displayStats.pendingOrders > 0 ? "warning" : "default"}
          />
          <MetricCard
            title="Low Stock"
            value={displayStats.lowStockCount}
            subtitle={displayStats.lowStockCount > 0 ? "Items need restock" : "Stock levels OK"}
            icon={AlertTriangle}
            variant={displayStats.lowStockCount > 0 ? "warning" : "default"}
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
            <RecentOrdersTable orders={displayOrders} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-4">
              <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
              <QuickActions pendingCount={displayStats.pendingOrders} />
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
