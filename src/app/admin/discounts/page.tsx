"use client"

import { useState, useMemo, useEffect } from "react"
import { AdminHeader } from "@/components/admin/admin-header"
import { useDiscountsStore, type Discount, type DiscountType, type DiscountStatus } from "@/lib/discounts-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Edit,
  Trash2,
  Copy,
  Percent,
  DollarSign,
  Calendar,
  Users,
  Tag,
  Power,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  fetchAdminDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
} from "@/lib/api"

type FilterStatus = "all" | DiscountStatus

// Map API discount to display format
function mapApiDiscount(apiDiscount: DiscountCode): Discount {
  const now = new Date()
  const validFrom = apiDiscount.validFrom ? new Date(apiDiscount.validFrom) : now
  const validUntil = apiDiscount.validUntil ? new Date(apiDiscount.validUntil) : null

  let status: DiscountStatus = "active"
  if (!apiDiscount.active) {
    status = "disabled"
  } else if (validUntil && validUntil < now) {
    status = "expired"
  } else if (validFrom > now) {
    status = "scheduled"
  }

  return {
    id: apiDiscount.id,
    code: apiDiscount.code,
    description: apiDiscount.description || "",
    type: apiDiscount.discountType as DiscountType,
    value: parseFloat(apiDiscount.discountValue),
    minOrderAmount: apiDiscount.minimumOrder ? parseFloat(apiDiscount.minimumOrder) : undefined,
    usageLimit: apiDiscount.maxUses || undefined,
    usageCount: apiDiscount.currentUses,
    startDate: validFrom,
    endDate: validUntil || undefined,
    status,
    createdAt: new Date(apiDiscount.createdAt),
    updatedAt: new Date(apiDiscount.createdAt),
  }
}

export default function DiscountsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [apiDiscounts, setApiDiscounts] = useState<Discount[]>([])

  const { discounts: localDiscounts, addDiscount, updateDiscount, deleteDiscount: localDelete, toggleStatus } = useDiscountsStore()

  // Fetch discounts from API
  useEffect(() => {
    async function loadDiscounts() {
      try {
        const data = await fetchAdminDiscountCodes()
        setApiDiscounts(data.map(mapApiDiscount))
        setIsUsingDemoData(false)
      } catch (err) {
        console.warn("Failed to fetch discounts from API, using demo data:", err)
        setIsUsingDemoData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadDiscounts()
  }, [])

  const discounts = isUsingDemoData ? localDiscounts : apiDiscounts

  // Handle API operations
  const handleCreate = async (data: Omit<Discount, "id" | "usageCount" | "status" | "createdAt" | "updatedAt">) => {
    if (isUsingDemoData) {
      addDiscount(data)
    } else {
      try {
        const result = await createDiscountCode({
          code: data.code,
          description: data.description,
          discountType: data.type,
          discountValue: data.value,
          minimumOrder: data.minOrderAmount,
          maxUses: data.usageLimit,
          validFrom: data.startDate.toISOString(),
          validUntil: data.endDate?.toISOString(),
          active: true,
        })
        setApiDiscounts((prev) => [...prev, mapApiDiscount(result)])
      } catch (err) {
        console.error("Failed to create discount:", err)
        // Fallback to local
        addDiscount(data)
      }
    }
    setShowCreateDialog(false)
    setEditingDiscount(null)
  }

  const handleUpdate = async (id: string, data: Partial<Discount>) => {
    if (isUsingDemoData) {
      updateDiscount(id, data)
    } else {
      try {
        const result = await updateDiscountCode(id, {
          code: data.code,
          description: data.description,
          discountType: data.type,
          discountValue: data.value,
          minimumOrder: data.minOrderAmount,
          maxUses: data.usageLimit,
          validFrom: data.startDate?.toISOString(),
          validUntil: data.endDate?.toISOString(),
        })
        setApiDiscounts((prev) =>
          prev.map((d) => (d.id === id ? mapApiDiscount(result) : d))
        )
      } catch (err) {
        console.error("Failed to update discount:", err)
        updateDiscount(id, data)
      }
    }
    setShowCreateDialog(false)
    setEditingDiscount(null)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this discount code?")) return

    if (isUsingDemoData) {
      localDelete(id)
    } else {
      try {
        await deleteDiscountCode(id)
        setApiDiscounts((prev) => prev.filter((d) => d.id !== id))
      } catch (err) {
        console.error("Failed to delete discount:", err)
        localDelete(id)
      }
    }
  }

  const handleToggleStatus = async (id: string) => {
    const discount = discounts.find((d) => d.id === id)
    if (!discount) return

    if (isUsingDemoData) {
      toggleStatus(id)
    } else {
      try {
        const newActive = discount.status === "disabled"
        const result = await updateDiscountCode(id, { active: newActive })
        setApiDiscounts((prev) =>
          prev.map((d) => (d.id === id ? mapApiDiscount(result) : d))
        )
      } catch (err) {
        console.error("Failed to toggle discount status:", err)
        toggleStatus(id)
      }
    }
  }

  const filteredDiscounts = useMemo(() => {
    let filtered = [...discounts]

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (d) => d.code.toLowerCase().includes(query) || d.description.toLowerCase().includes(query),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter)
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [discounts, searchQuery, statusFilter])

  const statusCounts = useMemo(
    () => ({
      all: discounts.length,
      active: discounts.filter((d) => d.status === "active").length,
      scheduled: discounts.filter((d) => d.status === "scheduled").length,
      expired: discounts.filter((d) => d.status === "expired").length,
      disabled: discounts.filter((d) => d.status === "disabled").length,
    }),
    [discounts],
  )

  const getStatusBadge = (status: DiscountStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Active</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Scheduled</Badge>
      case "expired":
        return <Badge className="bg-muted text-muted-foreground">Expired</Badge>
      case "disabled":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Disabled</Badge>
    }
  }

  const formatValue = (discount: Discount) => {
    if (discount.type === "percentage") {
      return `${discount.value}% off`
    }
    return `$${discount.value} off`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Discount Codes" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading discount codes...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Discount Codes" />

      <main className="p-4 lg:p-6 space-y-4">
        {/* Demo Mode Banner */}
        {isUsingDemoData && (
          <div className="bg-warning/10 border border-warning/50 rounded-lg p-3 text-sm text-warning">
            Using demo data - API unavailable
          </div>
        )}

        {/* Top controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discount codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Discount
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
          {[
            { value: "all" as FilterStatus, label: "All" },
            { value: "active" as FilterStatus, label: "Active" },
            { value: "scheduled" as FilterStatus, label: "Scheduled" },
            { value: "expired" as FilterStatus, label: "Expired" },
            { value: "disabled" as FilterStatus, label: "Disabled" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                statusFilter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {tab.label} ({statusCounts[tab.value]})
            </button>
          ))}
        </div>

        {/* Discounts list */}
        <div className="space-y-3">
          {filteredDiscounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-xl">
              <Percent className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">No discount codes found</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first discount code to get started"}
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Discount
              </Button>
            </div>
          ) : (
            filteredDiscounts.map((discount) => (
              <div
                key={discount.id}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                    discount.type === "percentage" ? "bg-primary/10" : "bg-green-500/10",
                  )}
                >
                  {discount.type === "percentage" ? (
                    <Percent className="w-6 h-6 text-primary" />
                  ) : (
                    <DollarSign className="w-6 h-6 text-green-600" />
                  )}
                </div>

                {/* Discount info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono font-semibold text-foreground">{discount.code}</h3>
                        {getStatusBadge(discount.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{discount.description}</p>
                    </div>
                    <p className="font-semibold text-foreground shrink-0">{formatValue(discount)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {discount.usageLimit && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {discount.usageCount}/{discount.usageLimit} used
                      </span>
                    )}
                    {discount.minOrderAmount && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        Min ${discount.minOrderAmount}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(discount.startDate), "MMM d")}
                      {discount.endDate && ` - ${format(new Date(discount.endDate), "MMM d, yyyy")}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="flex items-center gap-2" onClick={() => setEditingDiscount(discount)}>
                      <Edit className="w-4 h-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2"
                      onClick={() => navigator.clipboard.writeText(discount.code)}
                    >
                      <Copy className="w-4 h-4" /> Copy Code
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleToggleStatus(discount.id)}>
                      <Power className="w-4 h-4" />
                      {discount.status === "disabled" ? "Enable" : "Disable"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Create/Edit Dialog */}
      <DiscountDialog
        open={showCreateDialog || !!editingDiscount}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false)
            setEditingDiscount(null)
          }
        }}
        discount={editingDiscount}
        onSave={(data) => {
          if (editingDiscount) {
            handleUpdate(editingDiscount.id, data)
          } else {
            handleCreate(data)
          }
        }}
      />
    </div>
  )
}

// Discount Create/Edit Dialog Component
interface DiscountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  discount: Discount | null
  onSave: (data: Omit<Discount, "id" | "usageCount" | "status" | "createdAt" | "updatedAt">) => void
}

function DiscountDialog({ open, onOpenChange, discount, onSave }: DiscountDialogProps) {
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<DiscountType>("percentage")
  const [value, setValue] = useState("")
  const [minOrderAmount, setMinOrderAmount] = useState("")
  const [maxDiscount, setMaxDiscount] = useState("")
  const [usageLimit, setUsageLimit] = useState("")
  const [perCustomerLimit, setPerCustomerLimit] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [hasEndDate, setHasEndDate] = useState(false)

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      if (discount) {
        setCode(discount.code)
        setDescription(discount.description)
        setType(discount.type)
        setValue(String(discount.value))
        setMinOrderAmount(discount.minOrderAmount ? String(discount.minOrderAmount) : "")
        setMaxDiscount(discount.maxDiscount ? String(discount.maxDiscount) : "")
        setUsageLimit(discount.usageLimit ? String(discount.usageLimit) : "")
        setPerCustomerLimit(discount.perCustomerLimit ? String(discount.perCustomerLimit) : "")
        setStartDate(format(new Date(discount.startDate), "yyyy-MM-dd"))
        setHasEndDate(!!discount.endDate)
        setEndDate(discount.endDate ? format(new Date(discount.endDate), "yyyy-MM-dd") : "")
      } else {
        setCode("")
        setDescription("")
        setType("percentage")
        setValue("")
        setMinOrderAmount("")
        setMaxDiscount("")
        setUsageLimit("")
        setPerCustomerLimit("")
        setStartDate(format(new Date(), "yyyy-MM-dd"))
        setHasEndDate(false)
        setEndDate("")
      }
    }
  })

  const handleSubmit = () => {
    if (!code || !value || !startDate) return

    onSave({
      code: code.toUpperCase(),
      description,
      type,
      value: Number.parseFloat(value),
      minOrderAmount: minOrderAmount ? Number.parseFloat(minOrderAmount) : undefined,
      maxDiscount: maxDiscount ? Number.parseFloat(maxDiscount) : undefined,
      usageLimit: usageLimit ? Number.parseInt(usageLimit) : undefined,
      perCustomerLimit: perCustomerLimit ? Number.parseInt(perCustomerLimit) : undefined,
      startDate: new Date(startDate),
      endDate: hasEndDate && endDate ? new Date(endDate) : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{discount ? "Edit Discount Code" : "Create Discount Code"}</DialogTitle>
          <DialogDescription>
            {discount ? "Update the discount code details" : "Create a new discount code for customers"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Discount Code *</Label>
            <Input
              id="code"
              placeholder="e.g. SAVE20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the discount"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Type and Value */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Discount Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as DiscountType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {type === "percentage" ? "%" : "$"}
                </span>
                <Input
                  id="value"
                  type="number"
                  min="0"
                  max={type === "percentage" ? "100" : undefined}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Min Order & Max Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minOrder">Min Order Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="minOrder"
                  type="number"
                  min="0"
                  placeholder="No minimum"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {type === "percentage" && (
              <div className="space-y-2">
                <Label htmlFor="maxDiscount">Max Discount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="maxDiscount"
                    type="number"
                    min="0"
                    placeholder="No maximum"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Usage Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="usageLimit">Total Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perCustomer">Per Customer Limit</Label>
              <Input
                id="perCustomer"
                type="number"
                min="0"
                placeholder="Unlimited"
                value={perCustomerLimit}
                onChange={(e) => setPerCustomerLimit(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hasEndDate">Set Expiry Date</Label>
              <Switch id="hasEndDate" checked={hasEndDate} onCheckedChange={setHasEndDate} />
            </div>

            {hasEndDate && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!code || !value || !startDate}>
            {discount ? "Save Changes" : "Create Discount"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
