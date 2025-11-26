"use client"

import { useEffect, useState } from "react"
import { useMenuManagerStore, type MenuProduct } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, X } from "lucide-react"

interface MMQuickEditSheetProps {
  product: MenuProduct | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMQuickEditSheet({ product, open, onOpenChange }: MMQuickEditSheetProps) {
  const { categories, updateProduct } = useMenuManagerStore()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    inventory: "",
    lowStockThreshold: "",
    category: "",
    description: "",
    active: true,
    featured: false,
  })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        inventory: product.inventory.toString(),
        lowStockThreshold: product.lowStockThreshold.toString(),
        category: product.category,
        description: product.description,
        active: product.active,
        featured: product.featured,
      })
      setHasChanges(false)
    }
  }, [product])

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!product) return

    updateProduct(product.id, {
      name: formData.name,
      price: Number.parseFloat(formData.price) || 0,
      inventory: Number.parseInt(formData.inventory) || 0,
      lowStockThreshold: Number.parseInt(formData.lowStockThreshold) || 10,
      category: formData.category,
      description: formData.description,
      active: formData.active,
      featured: formData.featured,
    })

    onOpenChange(false)
  }

  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm("Discard unsaved changes?")) {
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  if (!product) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Edit Product
            <button onClick={handleCancel} className="ml-auto p-1 hover:bg-muted rounded">
              <X className="h-5 w-5" />
            </button>
          </SheetTitle>
          <SheetDescription>Make quick changes to this product</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Image Preview */}
          <div className="flex items-start gap-4">
            <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
              {product.image ? (
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <Button variant="outline" size="sm">
              Change Image
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Blue Dream - 3.5g"
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                className="pl-7"
              />
            </div>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inventory">Stock</Label>
              <Input
                id="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={(e) => handleChange("inventory", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Alert</Label>
              <Input
                id="threshold"
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description for customers"
              rows={3}
            />
          </div>

          {/* Status Toggles */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Visible to customers</p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleChange("active", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="featured">Featured</Label>
                <p className="text-xs text-muted-foreground">Display at top of category</p>
              </div>
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => handleChange("featured", checked)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
