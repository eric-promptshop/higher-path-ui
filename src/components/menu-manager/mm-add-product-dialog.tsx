"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ImageIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MMAddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMAddProductDialog({ open, onOpenChange }: MMAddProductDialogProps) {
  const { categories, addProduct } = useMenuManagerStore()

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    inventory: "0",
    lowStockThreshold: "10",
    tags: [] as string[],
    active: true,
    featured: false,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      category: "",
      inventory: "0",
      lowStockThreshold: "10",
      tags: [],
      active: true,
      featured: false,
    })
    setImagePreview(null)
    setTagInput("")
    setErrors({})
  }

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: "File too large (max 5MB)" }))
      return
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: "Invalid file type (JPG, PNG, WEBP only)" }))
      return
    }

    setImageUploading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
      setImageUploading(false)
      setErrors((prev) => ({ ...prev, image: "" }))
    }
    reader.onerror = () => {
      setErrors((prev) => ({ ...prev, image: "Failed to read file" }))
      setImageUploading(false)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleChange("tags", [...formData.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    handleChange(
      "tags",
      formData.tags.filter((t) => t !== tag),
    )
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      newErrors.price = "Price must be greater than $0"
    }

    if (!formData.category) {
      newErrors.category = "Category is required"
    }

    if (Number.parseInt(formData.inventory) < 0) {
      newErrors.inventory = "Inventory cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (publish: boolean) => {
    if (!validate()) return

    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    addProduct({
      name: formData.name,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      image: imagePreview || "",
      category: formData.category,
      inventory: Number.parseInt(formData.inventory) || 0,
      lowStockThreshold: Number.parseInt(formData.lowStockThreshold) || 10,
      tags: formData.tags,
      active: formData.active,
      featured: formData.featured,
    })

    setIsSaving(false)
    resetForm()
    onOpenChange(false)
  }

  const handleClose = () => {
    const hasData = formData.name || formData.price || formData.description || imagePreview
    if (hasData) {
      if (window.confirm("Discard unsaved changes?")) {
        resetForm()
        onOpenChange(false)
      }
    } else {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>Add a new product to your menu</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg transition-colors",
                errors.image ? "border-destructive" : "border-border hover:border-primary",
              )}
            >
              {imagePreview ? (
                <div className="relative aspect-square max-w-xs mx-auto p-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-6 right-6"
                    onClick={() => setImagePreview(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-12 cursor-pointer">
                  {imageUploading ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">Drag & drop image here or click to browse</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        Recommended: 800x800px, Max 5MB (JPG, PNG, WEBP)
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {errors.image && <p className="text-sm text-destructive">{errors.image}</p>}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder='e.g., "Blue Dream - 3.5g"'
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger className={cn(errors.category && "border-destructive")}>
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
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Brief description for customers"
                rows={3}
              />
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Pricing & Inventory</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    className={cn("pl-7", errors.price && "border-destructive")}
                    placeholder="0.00"
                  />
                </div>
                {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="inventory">Starting Inventory *</Label>
                <Input
                  id="inventory"
                  type="number"
                  min="0"
                  value={formData.inventory}
                  onChange={(e) => handleChange("inventory", e.target.value)}
                  className={cn(errors.inventory && "border-destructive")}
                />
                {errors.inventory && <p className="text-sm text-destructive">{errors.inventory}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Low Stock Alert Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) => handleChange("lowStockThreshold", e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">units</span>
              </div>
              <p className="text-xs text-muted-foreground">Alert when stock falls below this number</p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Visibility</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="active">Active</Label>
                <p className="text-xs text-muted-foreground">Visible to customers immediately</p>
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => handleSave(false)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Publish"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
