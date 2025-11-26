"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import { StatusBadge } from "@/components/admin/status-badge"
import { useAdminStore, type OrderStatus } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  MoreHorizontal,
  Printer,
  Send,
  Copy,
  X,
  MapPin,
  Phone,
  Plus,
  Truck,
  CheckCircle2,
} from "lucide-react"

const statusFlow: OrderStatus[] = ["pending", "confirmed", "packed", "ready", "completed"]

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { orders, updateOrderStatus, addInternalNote } = useAdminStore()
  const order = orders.find((o) => o.id === id)

  const [newNote, setNewNote] = useState("")
  const [isAddingNote, setIsAddingNote] = useState(false)

  if (!order) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Order Not Found" />
        <main className="p-4 lg:p-6">
          <div className="text-center py-16">
            <h2 className="text-lg font-medium mb-2">Order not found</h2>
            <p className="text-muted-foreground mb-4">The order you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/admin/orders">Back to Orders</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const handleStatusChange = (status: OrderStatus) => {
    updateOrderStatus(order.id, status, "Ryan")
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      addInternalNote(order.id, newNote.trim(), "Ryan")
      setNewNote("")
      setIsAddingNote(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const getNextStatus = (): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(order.status)
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1]
    }
    return null
  }

  const nextStatus = getNextStatus()

  return (
    <div className="min-h-screen">
      <AdminHeader title={`Order #${order.id}`} />

      <main className="p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Order #{order.id}</h1>
              <p className="text-sm text-muted-foreground">
                Placed {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-12 sm:ml-0">
            {/* Status selector */}
            <Select value={order.status} onValueChange={(v) => handleStatusChange(v as OrderStatus)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusFlow.map((status) => (
                  <SelectItem key={status} value={status}>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={status} />
                    </div>
                  </SelectItem>
                ))}
                <SelectItem value="cancelled">
                  <StatusBadge status="cancelled" />
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Quick action for next status */}
            {nextStatus && (
              <Button onClick={() => handleStatusChange(nextStatus)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print Packing Slip
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send Customer Update
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Copy className="w-4 h-4" /> Duplicate Order
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                  <X className="w-4 h-4" /> Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl">🌿</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity} × {formatCurrency(item.priceAtTime)}
                      </p>
                    </div>
                    <p className="font-medium">{formatCurrency(item.quantity * item.priceAtTime)}</p>
                  </div>
                ))}

                {/* Order summary */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery ({order.deliveryMethod})</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">{entry.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(entry.timestamp), "MMM d, h:mm a")} by {entry.by}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Internal Notes */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Internal Notes</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setIsAddingNote(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isAddingNote && (
                  <div className="mb-4 space-y-2">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddNote}>
                        Save Note
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false)
                          setNewNote("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {order.internalNotes.length === 0 && !isAddingNote ? (
                  <p className="text-sm text-muted-foreground">No internal notes yet.</p>
                ) : (
                  <div className="space-y-4">
                    {order.internalNotes
                      .slice()
                      .reverse()
                      .map((note, index) => (
                        <div key={index} className="pb-4 border-b border-border last:border-0 last:pb-0">
                          <p className="text-sm">{note.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(note.timestamp), "MMM d, h:mm a")} - {note.by}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="font-medium">{order.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {order.customerPhone}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Truck className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium capitalize">{order.deliveryMethod} Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      {order.deliveryMethod === "express" ? "Same day" : "1-2 business days"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div className="text-sm">
                    <p>{order.address.line1}</p>
                    {order.address.line2 && <p>{order.address.line2}</p>}
                    <p>
                      {order.address.city}, {order.address.state} {order.address.zip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Substitutions</p>
                  <p className="text-sm capitalize">
                    {order.substitutionPreference === "allow"
                      ? "Allow substitutions"
                      : order.substitutionPreference === "contact"
                        ? "Contact me first"
                        : "Cancel if unavailable"}
                  </p>
                </div>
                {order.notes && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Order Notes</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
