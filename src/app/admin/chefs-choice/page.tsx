"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  useChefsChoiceStore,
  type ChefChoiceTier,
  type ChefChoiceTemplate,
  type TierType,
} from "@/lib/chefs-choice-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChefHat,
  Plus,
  MoreHorizontal,
  DollarSign,
  Package,
  Users,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  FileText,
} from "lucide-react"

export default function ChefsChoicePage() {
  const {
    tiers,
    templates,
    subscriptions,
    addTier,
    updateTier,
    deleteTier,
    getCurrentTemplateForTier,
    getSubscriptionsByStatus,
  } = useChefsChoiceStore()

  // Dialog states
  const [showTierDialog, setShowTierDialog] = useState(false)
  const [editingTier, setEditingTier] = useState<ChefChoiceTier | null>(null)

  // Tier form state
  const [tierType, setTierType] = useState<TierType>("dollar")
  const [tierValue, setTierValue] = useState("")
  const [tierLabel, setTierLabel] = useState("")
  const [tierDescription, setTierDescription] = useState("")

  // Stats
  const activeSubscriptions = getSubscriptionsByStatus("active")
  const pausedSubscriptions = getSubscriptionsByStatus("paused")
  const dollarTiers = tiers.filter((t) => t.type === "dollar" && t.active)
  const volumeTiers = tiers.filter((t) => t.type === "volume" && t.active)

  // Reset form
  const resetTierForm = () => {
    setTierType("dollar")
    setTierValue("")
    setTierLabel("")
    setTierDescription("")
    setEditingTier(null)
  }

  // Open tier dialog for adding
  const openAddTierDialog = (type: TierType) => {
    resetTierForm()
    setTierType(type)
    setShowTierDialog(true)
  }

  // Open tier dialog for editing
  const openEditTierDialog = (tier: ChefChoiceTier) => {
    setEditingTier(tier)
    setTierType(tier.type)
    setTierValue(tier.value.toString())
    setTierLabel(tier.label)
    setTierDescription(tier.description || "")
    setShowTierDialog(true)
  }

  // Save tier
  const saveTier = () => {
    const value = parseFloat(tierValue)
    if (!tierLabel.trim() || isNaN(value)) return

    if (editingTier) {
      updateTier(editingTier.id, {
        type: tierType,
        value,
        label: tierLabel.trim(),
        description: tierDescription.trim() || undefined,
      })
    } else {
      const maxOrder = Math.max(
        0,
        ...tiers.filter((t) => t.type === tierType).map((t) => t.sortOrder)
      )
      addTier({
        type: tierType,
        value,
        label: tierLabel.trim(),
        description: tierDescription.trim() || undefined,
        active: true,
        sortOrder: maxOrder + 1,
      })
    }

    setShowTierDialog(false)
    resetTierForm()
  }

  // Delete tier
  const handleDeleteTier = (id: string) => {
    if (confirm("Are you sure you want to delete this tier?")) {
      deleteTier(id)
    }
  }

  // Toggle tier active status
  const toggleTierActive = (tier: ChefChoiceTier) => {
    updateTier(tier.id, { active: !tier.active })
  }

  // Get template for tier
  const getTemplateInfo = (tierId: string) => {
    const template = getCurrentTemplateForTier(tierId)
    return template
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Chef's Choice" />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {activeSubscriptions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Active Subscriptions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">
                    {pausedSubscriptions.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Paused</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{dollarTiers.length}</p>
                  <p className="text-sm text-muted-foreground">Price Tiers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{volumeTiers.length}</p>
                  <p className="text-sm text-muted-foreground">Volume Tiers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/chefs-choice/subscriptions">
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Subscriptions
            </Button>
          </Link>
          <Link href="/admin/chefs-choice/templates">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              All Templates
            </Button>
          </Link>
        </div>

        {/* Tier Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Tier Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dollar" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="dollar" className="gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price Tiers
                </TabsTrigger>
                <TabsTrigger value="volume" className="gap-2">
                  <Package className="w-4 h-4" />
                  Volume Tiers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dollar" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => openAddTierDialog("dollar")}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Price Tier
                  </Button>
                </div>

                {dollarTiers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No price tiers configured yet</p>
                    <p className="text-sm">
                      Add tiers like $50, $100, $150 boxes
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {dollarTiers
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((tier) => {
                        const template = getTemplateInfo(tier.id)
                        return (
                          <TierCard
                            key={tier.id}
                            tier={tier}
                            template={template}
                            onEdit={() => openEditTierDialog(tier)}
                            onDelete={() => handleDeleteTier(tier.id)}
                            onToggleActive={() => toggleTierActive(tier)}
                          />
                        )
                      })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="volume" className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => openAddTierDialog("volume")}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Volume Tier
                  </Button>
                </div>

                {volumeTiers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No volume tiers configured yet</p>
                    <p className="text-sm">Add tiers like 1oz, 2oz, 4oz packs</p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {volumeTiers
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((tier) => {
                        const template = getTemplateInfo(tier.id)
                        return (
                          <TierCard
                            key={tier.id}
                            tier={tier}
                            template={template}
                            onEdit={() => openEditTierDialog(tier)}
                            onDelete={() => handleDeleteTier(tier.id)}
                            onToggleActive={() => toggleTierActive(tier)}
                          />
                        )
                      })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Templates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Current Templates
            </CardTitle>
            <Link href="/admin/chefs-choice/templates/new">
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Template
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No templates created yet</p>
                <p className="text-sm">
                  Create templates to define what products go in each tier
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates
                  .filter((t) => t.active)
                  .slice(0, 5)
                  .map((template) => {
                    const tier = tiers.find((t) => t.id === template.tierId)
                    return (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{template.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {tier?.label} • {template.items.length} items
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Active since{" "}
                            {format(
                              new Date(template.effectiveFrom),
                              "MMM d, yyyy"
                            )}
                          </Badge>
                          <Link
                            href={`/admin/chefs-choice/templates/${template.id}`}
                          >
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                {templates.filter((t) => t.active).length > 5 && (
                  <Link href="/admin/chefs-choice/templates">
                    <Button variant="ghost" className="w-full">
                      View all templates
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Tier Dialog */}
      <Dialog
        open={showTierDialog}
        onOpenChange={(open) => {
          setShowTierDialog(open)
          if (!open) resetTierForm()
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "Edit Tier" : "Add New Tier"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Tier Type */}
            <div className="space-y-2">
              <Label>Tier Type</Label>
              <Select
                value={tierType}
                onValueChange={(v) => setTierType(v as TierType)}
                disabled={!!editingTier}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dollar">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Price Tier
                    </span>
                  </SelectItem>
                  <SelectItem value="volume">
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Volume Tier
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div className="space-y-2">
              <Label htmlFor="value">
                {tierType === "dollar" ? "Price ($)" : "Volume (oz)"}
              </Label>
              <Input
                id="value"
                type="number"
                value={tierValue}
                onChange={(e) => setTierValue(e.target.value)}
                placeholder={tierType === "dollar" ? "100" : "2"}
              />
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Display Label *</Label>
              <Input
                id="label"
                value={tierLabel}
                onChange={(e) => setTierLabel(e.target.value)}
                placeholder={tierType === "dollar" ? "$100 Box" : "2oz Pack"}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={tierDescription}
                onChange={(e) => setTierDescription(e.target.value)}
                placeholder="A brief description for customers..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveTier}
              disabled={!tierLabel.trim() || !tierValue}
            >
              {editingTier ? "Save Changes" : "Add Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Tier Card Component
function TierCard({
  tier,
  template,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  tier: ChefChoiceTier
  template: ChefChoiceTemplate | undefined
  onEdit: () => void
  onDelete: () => void
  onToggleActive: () => void
}) {
  return (
    <div className="border rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium">{tier.label}</h3>
          {tier.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {tier.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleActive}>
              {tier.active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {template ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Current Template:</p>
          <div className="bg-muted/50 rounded p-2">
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-muted-foreground">
              {template.items.length} items
            </p>
          </div>
          <Link href={`/admin/chefs-choice/templates/${template.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Pencil className="w-3 h-3" />
              Edit Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">No active template</p>
          <Link href={`/admin/chefs-choice/templates/new?tierId=${tier.id}`}>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-3 h-3" />
              Create Template
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
