"use client"

import { useState, useMemo, useEffect } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { useAdminStore } from "@/lib/admin-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, MoreHorizontal, Users, Phone, Loader2, Mail, Plus, Tag, ChevronDown, X } from "lucide-react"
import { fetchAdminCustomers, type AdminCustomer } from "@/lib/api"

// Predefined tags with colors
const PREDEFINED_TAGS = [
  { name: "VIP", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { name: "Wholesale", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { name: "Preferred", color: "bg-green-100 text-green-800 border-green-300" },
  { name: "Flagged", color: "bg-red-100 text-red-800 border-red-300" },
  { name: "New", color: "bg-purple-100 text-purple-800 border-purple-300" },
] as const

const getTagColor = (tagName: string) => {
  const predefined = PREDEFINED_TAGS.find(t => t.name === tagName)
  return predefined?.color || "bg-gray-100 text-gray-800 border-gray-300"
}

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  notes: string | null
  tags: string[]
  orders: number
  totalSpent: number
  lastOrder: Date | null
}

export default function CustomersPage() {
  const router = useRouter()
  const { orders } = useAdminStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [apiCustomers, setApiCustomers] = useState<AdminCustomer[]>([])

  // Dialog states
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [showTagsDialog, setShowTagsDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  // Local customer store (for demo - augments API/demo data)
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])

  // Tag filter
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([])

  // Customer form state
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPhone, setFormPhone] = useState("")
  const [formAddressLine1, setFormAddressLine1] = useState("")
  const [formAddressLine2, setFormAddressLine2] = useState("")
  const [formCity, setFormCity] = useState("")
  const [formState, setFormState] = useState("")
  const [formZip, setFormZip] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [formTags, setFormTags] = useState<string[]>([])
  const [showAddressFields, setShowAddressFields] = useState(false)
  const [newCustomTag, setNewCustomTag] = useState("")

  // Note dialog state
  const [noteText, setNoteText] = useState("")

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
          notes: null,
          tags: [],
          orders: 1,
          totalSpent: order.total,
          lastOrder: new Date(order.createdAt),
        })
      }
    })

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [orders])

  // Map API customers to display format and merge with local customers
  const baseCustomers: Customer[] = isUsingDemoData
    ? demoCustomers
    : apiCustomers.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        notes: null,
        tags: [],
        orders: c.orderCount || 0,
        totalSpent: c.totalSpent || 0,
        lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate) : null,
      })).sort((a, b) => b.totalSpent - a.totalSpent)

  // Merge base customers with local modifications
  const customers: Customer[] = useMemo(() => {
    const merged = [...baseCustomers]

    // Apply local modifications (tags, notes, etc.)
    localCustomers.forEach(local => {
      const existingIndex = merged.findIndex(c => c.id === local.id)
      if (existingIndex >= 0) {
        // Update existing customer
        merged[existingIndex] = { ...merged[existingIndex], ...local }
      } else {
        // Add new local customer
        merged.push(local)
      }
    })

    return merged.sort((a, b) => b.totalSpent - a.totalSpent)
  }, [baseCustomers, localCustomers])

  // All available tags (predefined + custom)
  const allTags = useMemo(() => {
    return [...PREDEFINED_TAGS.map(t => t.name), ...customTags]
  }, [customTags])

  const filteredCustomers = useMemo(() => {
    let filtered = customers

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          (c.phone && c.phone.includes(query)) ||
          (c.email && c.email.toLowerCase().includes(query)) ||
          c.id.toLowerCase().includes(query),
      )
    }

    // Filter by selected tags
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter(c =>
        selectedTagFilters.some(tag => c.tags.includes(tag))
      )
    }

    return filtered
  }, [customers, searchQuery, selectedTagFilters])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  // Reset form
  const resetForm = () => {
    setFormName("")
    setFormEmail("")
    setFormPhone("")
    setFormAddressLine1("")
    setFormAddressLine2("")
    setFormCity("")
    setFormState("")
    setFormZip("")
    setFormNotes("")
    setFormTags([])
    setShowAddressFields(false)
    setEditingCustomer(null)
  }

  // Open customer dialog for adding new customer
  const openAddCustomerDialog = () => {
    resetForm()
    setShowCustomerDialog(true)
  }

  // Open customer dialog for editing
  const openEditCustomerDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormName(customer.name)
    setFormEmail(customer.email || "")
    setFormPhone(customer.phone || "")
    setFormAddressLine1(customer.address?.line1 || "")
    setFormAddressLine2(customer.address?.line2 || "")
    setFormCity(customer.address?.city || "")
    setFormState(customer.address?.state || "")
    setFormZip(customer.address?.zip || "")
    setFormNotes(customer.notes || "")
    setFormTags(customer.tags || [])
    setShowAddressFields(!!(customer.address?.line1))
    setShowCustomerDialog(true)
  }

  // Save customer (add or update)
  const saveCustomer = () => {
    if (!formName.trim()) return

    const customerData: Customer = {
      id: editingCustomer?.id || `cust_${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      address: formAddressLine1.trim() ? {
        line1: formAddressLine1.trim(),
        line2: formAddressLine2.trim() || undefined,
        city: formCity.trim(),
        state: formState.trim(),
        zip: formZip.trim(),
      } : undefined,
      notes: formNotes.trim() || null,
      tags: formTags,
      orders: editingCustomer?.orders || 0,
      totalSpent: editingCustomer?.totalSpent || 0,
      lastOrder: editingCustomer?.lastOrder || null,
    }

    setLocalCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.id === customerData.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = customerData
        return updated
      }
      return [...prev, customerData]
    })

    setShowCustomerDialog(false)
    resetForm()
  }

  // Open note dialog
  const openNoteDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setNoteText("")
    setShowNoteDialog(true)
  }

  // Save note
  const saveNote = () => {
    if (!editingCustomer || !noteText.trim()) return

    const timestamp = format(new Date(), "MMM d, yyyy h:mm a")
    const newNote = `[${timestamp}] ${noteText.trim()}`
    const updatedNotes = editingCustomer.notes
      ? `${editingCustomer.notes}\n${newNote}`
      : newNote

    setLocalCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.id === editingCustomer.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], notes: updatedNotes }
        return updated
      }
      return [...prev, { ...editingCustomer, notes: updatedNotes }]
    })

    setShowNoteDialog(false)
    setNoteText("")
    setEditingCustomer(null)
  }

  // Open tags dialog
  const openTagsDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormTags(customer.tags || [])
    setShowTagsDialog(true)
  }

  // Save tags
  const saveTags = () => {
    if (!editingCustomer) return

    setLocalCustomers(prev => {
      const existingIndex = prev.findIndex(c => c.id === editingCustomer.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = { ...updated[existingIndex], tags: formTags }
        return updated
      }
      return [...prev, { ...editingCustomer, tags: formTags }]
    })

    setShowTagsDialog(false)
    setFormTags([])
    setEditingCustomer(null)
  }

  // Toggle tag in form
  const toggleFormTag = (tag: string) => {
    setFormTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Add custom tag
  const addCustomTag = () => {
    const tag = newCustomTag.trim()
    if (tag && !allTags.includes(tag)) {
      setCustomTags(prev => [...prev, tag])
      setFormTags(prev => [...prev, tag])
    }
    setNewCustomTag("")
  }

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    setSelectedTagFilters(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Navigate to orders filtered by customer
  const viewCustomerOrders = (customerId: string) => {
    router.push(`/admin/orders?customer=${customerId}`)
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

        {/* Search and Actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Tag Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Tag className="w-4 h-4" />
                Tags
                {selectedTagFilters.length > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {selectedTagFilters.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {allTags.length === 0 ? (
                <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                  No tags created yet
                </div>
              ) : (
                <>
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTagFilters.includes(tag)}
                      onCheckedChange={() => toggleTagFilter(tag)}
                    >
                      <Badge variant="outline" className={`${getTagColor(tag)} border`}>
                        {tag}
                      </Badge>
                    </DropdownMenuCheckboxItem>
                  ))}
                  {selectedTagFilters.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setSelectedTagFilters([])}>
                        Clear filters
                      </DropdownMenuItem>
                    </>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Customer Button */}
          <Button onClick={openAddCustomerDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{customer.name}</h3>
                          {/* Customer Tags */}
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {customer.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={`${getTagColor(tag)} border text-xs px-1.5 py-0`}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
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
                        {/* Notes preview */}
                        {customer.notes && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 line-clamp-1">
                            {customer.notes.split('\n').pop()}
                          </div>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => viewCustomerOrders(customer.id)}>
                          View Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditCustomerDialog(customer)}>
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openNoteDialog(customer)}>
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openTagsDialog(customer)}>
                          <Tag className="w-4 h-4 mr-2" />
                          Manage Tags
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Customer Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={(open) => {
        setShowCustomerDialog(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Customer name"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                />
              </div>
            </div>

            {/* Address (Collapsible) */}
            <Collapsible open={showAddressFields} onOpenChange={setShowAddressFields}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-2 px-0">
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAddressFields ? "rotate-180" : ""}`} />
                  {showAddressFields ? "Hide Address" : "Add Address"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input
                    id="line1"
                    value={formAddressLine1}
                    onChange={(e) => setFormAddressLine1(e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input
                    id="line2"
                    value={formAddressLine2}
                    onChange={(e) => setFormAddressLine2(e.target.value)}
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP</Label>
                    <Input
                      id="zip"
                      value={formZip}
                      onChange={(e) => setFormZip(e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className={`${formTags.includes(tag.name) ? tag.color : "bg-transparent text-muted-foreground"} border cursor-pointer transition-colors`}
                    onClick={() => toggleFormTag(tag.name)}
                  >
                    {tag.name}
                    {formTags.includes(tag.name) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
                {customTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`${formTags.includes(tag) ? getTagColor(tag) : "bg-transparent text-muted-foreground"} border cursor-pointer transition-colors`}
                    onClick={() => toggleFormTag(tag)}
                  >
                    {tag}
                    {formTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
              {/* Add custom tag */}
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add custom tag..."
                  value={newCustomTag}
                  onChange={(e) => setNewCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomTag}
                  disabled={!newCustomTag.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Add any notes about this customer..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveCustomer} disabled={!formName.trim()}>
              {editingCustomer ? "Save Changes" : "Add Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={(open) => {
        setShowNoteDialog(open)
        if (!open) {
          setNoteText("")
          setEditingCustomer(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Note for {editingCustomer?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Existing notes */}
            {editingCustomer?.notes && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Previous Notes</Label>
                <div className="bg-muted/50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {editingCustomer.notes}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="note">New Note</Label>
              <Textarea
                id="note"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveNote} disabled={!noteText.trim()}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Tags Dialog */}
      <Dialog open={showTagsDialog} onOpenChange={(open) => {
        setShowTagsDialog(open)
        if (!open) {
          setFormTags([])
          setEditingCustomer(null)
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Tags for {editingCustomer?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Tags</Label>
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <Badge
                    key={tag.name}
                    variant="outline"
                    className={`${formTags.includes(tag.name) ? tag.color : "bg-transparent text-muted-foreground"} border cursor-pointer transition-colors`}
                    onClick={() => toggleFormTag(tag.name)}
                  >
                    {tag.name}
                    {formTags.includes(tag.name) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
                {customTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={`${formTags.includes(tag) ? getTagColor(tag) : "bg-transparent text-muted-foreground"} border cursor-pointer transition-colors`}
                    onClick={() => toggleFormTag(tag)}
                  >
                    {tag}
                    {formTags.includes(tag) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add custom tag */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag..."
                value={newCustomTag}
                onChange={(e) => setNewCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomTag}
                disabled={!newCustomTag.trim()}
              >
                Add
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTags}>
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
