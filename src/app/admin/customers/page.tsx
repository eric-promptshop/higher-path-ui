"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAdminStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Users, Phone, Loader2, Mail } from "lucide-react"
import { fetchAdminCustomers, type AdminCustomer } from "@/lib/api"

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  orders: number
  totalSpent: number
  lastOrder: Date | null
}

export default function CustomersPage() {
  const { orders } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [apiCustomers, setApiCustomers] = useState<AdminCustomer[]>([])

  // Fetch customers from API
  useEffect(() => {
    async function loadCustomers() {
      try {
        const data = await fetchAdminCustomers()
        setApiCustomers(data)
        setIsUsingDemoData(false)
      } catch (err) {
        console.warn("Failed to fetch customers from API, using demo data:", err)
        setIsUsingDemoData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadCustomers()
  }, [])

  // Derive customers from orders (demo fallback)
  const demoCustomers = useMemo(() => {
    const customerMap = new Map<string, Customer>()

    orders.forEach((order) => {
      const existing = customerMap.get(order.customerId)
      if (existing) {
        existing.orders++
        existing.totalSpent += order.total
        if (new Date(order.createdAt) > (existing.lastOrder || new Date(0))) {
          existing.lastOrder = new Date(order.createdAt)
        }
      } else {
        customerMap.set(order.customerId, {
          id: order.customerId,
          name: order.customerName,
          phone: order.customerPhone,
          email: null,
          orders: 1,
          totalSpent: order.total,
          lastOrder: new Date(order.createdAt),
        })
      }
    })

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [orders])

  // Map API customers to display format
  const customers: Customer[] = isUsingDemoData
    ? demoCustomers
    : apiCustomers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        orders: c.orderCount || 0,
        totalSpent: c.totalSpent || 0,
        lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate) : null,
      })).sort((a, b) => b.totalSpent - a.totalSpent)

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers
    const query = searchQuery.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query)) ||
        (c.email && c.email.toLowerCase().includes(query)) ||
        c.id.toLowerCase().includes(query),
    )
  }, [customers, searchQuery])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Customers" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Customers" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Demo Mode Banner */}
        {isUsingDemoData && (
          <div className="bg-warning/10 border border-warning/50 rounded-lg p-3 text-sm text-warning">
            Using demo data - API unavailable
          </div>
        )}

        {/* Search */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{customers.length}</p>
                  <p className="text-sm text-muted-foreground">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div>
                <p className="text-2xl font-semibold">
                  {formatCurrency(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0)}
                </p>
                <p className="text-sm text-muted-foreground">Avg Lifetime Value</p>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="pt-6">
              <div>
                <p className="text-2xl font-semibold">{(orders.length / customers.length || 0).toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Avg Orders/Customer</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers list */}
        <div className="space-y-3">
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No customers found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "Customers will appear as orders are placed"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium">{customer.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          {customer.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </span>
                          )}
                          {customer.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {customer.email}
                            </span>
                          )}
                          {!customer.phone && !customer.email && (
                            <span className="text-muted-foreground/60">No contact info</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-muted-foreground">
                            {customer.orders} order{customer.orders !== 1 ? "s" : ""}
                          </span>
                          <span className="text-muted-foreground">·</span>
                          <span className="font-medium">{formatCurrency(customer.totalSpent)} lifetime</span>
                          {customer.lastOrder && (
                            <>
                              <span className="text-muted-foreground">·</span>
                              <span className="text-muted-foreground">Last: {format(customer.lastOrder, "MMM d")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Orders</DropdownMenuItem>
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
