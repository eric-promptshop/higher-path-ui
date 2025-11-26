"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAdminStore } from "@/lib/admin-store"
import { products } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Minus, X, Search } from "lucide-react"
import type { Product } from "@/lib/store"

interface OrderItemDraft {
  product: Product
  quantity: number
}

export default function NewOrderPage() {
  const router = useRouter()
  const { addOrder } = useAdminStore()

  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [items, setItems] = useState<OrderItemDraft[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard")
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  })
  const [notes, setNotes] = useState("")
  const [substitutionPreference, setSubstitutionPreference] = useState<"allow" | "contact" | "cancel">("contact")

  const filteredProducts = products.filter(
    (p) =>
      p.inventory > 0 &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const addItem = (product: Product) => {
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      setItems(
        items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, product.inventory) } : i,
        ),
      )
    } else {
      setItems([...items, { product, quantity: 1 }])
    }
    setSearchQuery("")
  }

  const updateItemQuantity = (productId: string, delta: number) => {
    setItems(
      items
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta
            if (newQty <= 0) return null
            return { ...i, quantity: Math.min(newQty, i.product.inventory) }
          }
          return i
        })
        .filter(Boolean) as OrderItemDraft[],
    )
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.product.id !== productId))
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const deliveryFee = deliveryMethod === "express" ? 25 : 15
  const total = subtotal + deliveryFee

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const handleSubmit = () => {
    if (!customerName || !customerPhone || items.length === 0 || !address.line1 || !address.city) {
      return
    }

    addOrder({
      customerId: Math.random().toString(36).substr(2, 3).toUpperCase(),
      customerName,
      customerPhone,
      items: items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        priceAtTime: i.product.price,
      })),
      subtotal,
      deliveryFee,
      total,
      status: "pending",
      deliveryMethod,
      address,
      notes: notes || undefined,
      substitutionPreference,
      internalNotes: [],
    })

    router.push("/admin/orders")
  }

  const isValid = customerName && customerPhone && items.length > 0 && address.line1 && address.city

  return (
    <div className="min-h-screen">
      <AdminHeader title="New Order" />

      <main className="p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Create New Order</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer Name *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products to add..."
                    className="pl-9"
                  />
                  {searchQuery && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <p className="p-3 text-sm text-muted-foreground">No products found</p>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => addItem(product)}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {product.category} · {product.inventory} in stock
                              </p>
                            </div>
                            <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Added items */}
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No items added yet. Search for products above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(item.product.price)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateItemQuantity(item.product.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateItemQuantity(item.product.id, 1)}
                            disabled={item.quantity >= item.product.inventory}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="font-medium w-20 text-right">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <Select value={deliveryMethod} onValueChange={(v) => setDeliveryMethod(v as "standard" | "express")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Delivery ($15)</SelectItem>
                      <SelectItem value="express">Express Delivery ($25)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line1">Street Address *</Label>
                  <Input
                    id="line1"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="line2">Apt, Suite, etc.</Label>
                  <Input
                    id="line2"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    placeholder="Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="Austin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      placeholder="78701"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Substitution Preference</Label>
                  <Select
                    value={substitutionPreference}
                    onValueChange={(v) => setSubstitutionPreference(v as "allow" | "contact" | "cancel")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow similar substitutions</SelectItem>
                      <SelectItem value="contact">Contact customer first</SelectItem>
                      <SelectItem value="cancel">Cancel if unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add items to see summary</p>
                ) : (
                  <>
                    <div className="space-y-2 text-sm">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {item.product.name} x{item.quantity}
                          </span>
                          <span>{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </>
                )}

                <Button className="w-full" size="lg" disabled={!isValid} onClick={handleSubmit}>
                  Create Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
