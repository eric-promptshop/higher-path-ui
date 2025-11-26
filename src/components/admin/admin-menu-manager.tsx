"use client"

import { useState, useMemo } from "react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { MMCategoryTabs } from "@/components/menu-manager/mm-category-tabs"
import { MMPublishBar } from "@/components/menu-manager/mm-publish-bar"
import { MMProductGrid } from "@/components/menu-manager/mm-product-grid"
import { MMAddProductDialog } from "@/components/menu-manager/mm-add-product-dialog"
import { MMSettingsSheet } from "@/components/menu-manager/mm-settings-sheet"
import { MMPreviewDialog } from "@/components/menu-manager/mm-preview-dialog"
import { MMChangesSheet } from "@/components/menu-manager/mm-changes-sheet"
import { MMHistoryLog } from "@/components/menu-manager/mm-history-log"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye, Settings, History, SlidersHorizontal } from "lucide-react"

export function AdminMenuManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const { products, categories, showInactive, pendingChanges } = useMenuManagerStore()

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filter by active status
    if (!showInactive) {
      result = result.filter((p) => p.active)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      const category = categories.find((c) => c.id === selectedCategory)
      if (category) {
        result = result.filter((p) => p.category === category.name)
      }
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query),
      )
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "stock-low":
        result.sort((a, b) => a.inventory - b.inventory)
        break
      case "recent":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case "featured":
      default:
        result.sort((a, b) => {
          if (a.featured && !b.featured) return -1
          if (!a.featured && b.featured) return 1
          return 0
        })
        break
    }

    return result
  }, [products, categories, selectedCategory, searchQuery, sortBy, showInactive])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="stock-low">Stock: Low First</SelectItem>
            <SelectItem value="recent">Recently Updated</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowHistory(true)} title="History">
            <History className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowPreview(true)} title="Preview">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(true)} title="Settings">
            <Settings className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowAddProduct(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <MMCategoryTabs selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      {/* Product Grid */}
      <MMProductGrid products={filteredProducts} onAddProduct={() => setShowAddProduct(true)} />

      {/* Publish Bar (when there are pending changes) */}
      {pendingChanges.length > 0 && <MMPublishBar onViewChanges={() => setShowChanges(true)} />}

      {/* Dialogs and Sheets */}
      <MMAddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} />
      <MMSettingsSheet open={showSettings} onOpenChange={setShowSettings} />
      <MMPreviewDialog open={showPreview} onOpenChange={setShowPreview} />
      <MMChangesSheet open={showChanges} onOpenChange={setShowChanges} onPublish={() => {}} />
      <MMHistoryLog open={showHistory} onOpenChange={setShowHistory} />
    </div>
  )
}
