"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatDistanceToNow, format, isToday, isThisWeek } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { useAdminStore, type OrderStatus } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Printer,
  Send,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react"

const statusOptions: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const dateOptions = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
]

export default function OrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query) ||
          o.items.some((item) => item.product.name.toLowerCase().includes(query)),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((o) => o.status === statusFilter)
    }

    // Date filter
    if (dateFilter === "today") {
      filtered = filtered.filter((o) => isToday(new Date(o.createdAt)))
    } else if (dateFilter === "week") {
      filtered = filtered.filter((o) => isThisWeek(new Date(o.createdAt)))
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = filtered.filter((o) => new Date(o.createdAt) >= monthAgo)
    }

    return filtered
  }, [orders, searchQuery, statusFilter, dateFilter])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(paginatedOrders.map((o) => o.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId])
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId))
    }
  }

  const handleBulkStatusUpdate = (status: OrderStatus) => {
    selectedOrders.forEach((orderId) => {
      updateOrderStatus(orderId, status, "Ryan")
    })
    setSelectedOrders([])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  // Status counts for filter badges
  const statusCounts = useMemo(() => {
    return orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<OrderStatus, number>,
    )
  }, [orders])

  return (
    <div className="min-h-screen">
      <AdminHeader title="Orders" />

      <main className="p-4 lg:p-6 space-y-4">
        {/* Top controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-1 gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, customers, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px] hidden sm:flex">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button asChild>
            <Link href="/admin/orders/new">
              <Plus className="w-4 h-4 mr-2" /> New Order
            </Link>
          </Button>
        </div>

        {/* Status filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {statusOptions.slice(1).map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(statusFilter === option.value ? "all" : (option.value as OrderStatus))}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {option.label}
              <span className="text-xs opacity-70">({statusCounts[option.value as OrderStatus] || 0})</span>
            </button>
          ))}
        </div>

        {/* Bulk actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-sm font-medium">{selectedOrders.length} selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("confirmed")}>
                  Mark as Confirmed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("packed")}>Mark as Packed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusUpdate("ready")}>Mark as Ready</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Print Packing Slips</DropdownMenuItem>
                <DropdownMenuItem>Export Selected</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={() => setSelectedOrders([])}>
              Clear
            </Button>
          </div>
        )}

        {/* Orders table/cards */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <ClipboardList className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No orders found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search term"
                  : "Orders will appear here as customers place them"}
              </p>
              <div className="flex gap-2">
                {(searchQuery || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setStatusFilter("all")
                      setDateFilter("all")
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
                <Button asChild>
                  <Link href="/admin/orders/new">
                    <Plus className="w-4 h-4 mr-2" /> New Order
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden lg:table w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-3 px-4 w-10">
                      <Checkbox
                        checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Order
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Items
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Total
                    </th>
                    <th className="py-3 px-4 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          #{order.id}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.customerName}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {isToday(new Date(order.createdAt))
                          ? format(new Date(order.createdAt), "h:mm a")
                          : format(new Date(order.createdAt), "MMM d, h:mm a")}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{order.items.length}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(order.total)}</td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`} className="flex items-center gap-2">
                                <Eye className="w-4 h-4" /> View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Printer className="w-4 h-4" /> Print Slip
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2">
                              <Send className="w-4 h-4" /> Send Update
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "confirmed", "Ryan")}
                              disabled={order.status !== "pending"}
                            >
                              Mark Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "packed", "Ryan")}
                              disabled={order.status !== "confirmed"}
                            >
                              Mark Packed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateOrderStatus(order.id, "ready", "Ryan")}
                              disabled={order.status !== "packed"}
                            >
                              Mark Ready
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-border">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                        />
                        <div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            #{order.id}
                          </Link>
                          <span className="mx-2 text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Print Slip</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 ml-7">{order.customerName}</p>
                    <div className="flex items-center justify-between ml-7">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="text-sm text-muted-foreground">{order.items.length} items</span>
                      </div>
                      <span className="font-medium">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
