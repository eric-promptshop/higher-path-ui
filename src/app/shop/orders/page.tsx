"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Clock, CheckCircle, Truck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { fetchCustomerOrders, type OrderWithItems } from "@/lib/api"

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: <CheckCircle className="h-4 w-4" /> },
  packed: { label: "Packed", color: "bg-purple-100 text-purple-800", icon: <Package className="h-4 w-4" /> },
  ready: { label: "Ready", color: "bg-green-100 text-green-800", icon: <Truck className="h-4 w-4" /> },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800", icon: <Clock className="h-4 w-4" /> },
}

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect if not authenticated as customer
    if (!isAuthenticated || user?.role !== "customer") {
      router.push("/")
      return
    }

    async function loadOrders() {
      try {
        const data = await fetchCustomerOrders()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders")
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "customer") {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 h-16 max-w-4xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push("/shop")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">My Orders</h1>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <Button onClick={() => router.push("/shop")}>Browse Menu</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              return (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Order #{order.orderNumber}</CardTitle>
                      <Badge className={status.color}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Order Items */}
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium">${(parseFloat(item.totalPrice) || 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-semibold text-primary">${(parseFloat(order.total) || 0).toFixed(2)}</span>
                    </div>

                    {/* Delivery Address */}
                    {order.deliveryAddress && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Delivery:</span> {order.deliveryAddress}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
