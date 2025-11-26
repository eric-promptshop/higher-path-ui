"use client"

import { useState, useMemo } from "react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { MMHeader } from "@/components/menu-manager/mm-header"
import { MMCategoryTabs } from "@/components/menu-manager/mm-category-tabs"
import { MMPublishBar } from "@/components/menu-manager/mm-publish-bar"
import { MMProductGrid } from "@/components/menu-manager/mm-product-grid"
import { MMAddProductDialog } from "@/components/menu-manager/mm-add-product-dialog"
import { MMSettingsSheet } from "@/components/menu-manager/mm-settings-sheet"
import { MMPreviewDialog } from "@/components/menu-manager/mm-preview-dialog"
import { MMChangesSheet } from "@/components/menu-manager/mm-changes-sheet"
import { MMHistoryLog } from "@/components/menu-manager/mm-history-log"
import { MMMobileActions } from "@/components/menu-manager/mm-mobile-actions"

export default function MenuManagerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)

  const { products, categories, showInactive, pendingChanges, publishMenu } = useMenuManagerStore()

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

  const handlePublish = () => {
    setShowPublishConfirm(true)
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-20">
      <MMHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onAddProduct={() => setShowAddProduct(true)}
        onPreview={() => setShowPreview(true)}
        onSettings={() => setShowSettings(true)}
      />

      <MMCategoryTabs selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <main className="p-4 max-w-7xl mx-auto">
        <MMProductGrid products={filteredProducts} onAddProduct={() => setShowAddProduct(true)} />
      </main>

      {/* Mobile Actions */}
      <MMMobileActions
        onSearch={() => setShowMobileSearch(true)}
        onAddProduct={() => setShowAddProduct(true)}
        onPreview={() => setShowPreview(true)}
        onSettings={() => setShowSettings(true)}
        onHistory={() => setShowHistory(true)}
      />

      <MMPublishBar onViewChanges={() => setShowChanges(true)} />

      {/* Dialogs and Sheets */}
      <MMAddProductDialog open={showAddProduct} onOpenChange={setShowAddProduct} />

      <MMSettingsSheet open={showSettings} onOpenChange={setShowSettings} />

      <MMPreviewDialog open={showPreview} onOpenChange={setShowPreview} />

      <MMChangesSheet open={showChanges} onOpenChange={setShowChanges} onPublish={handlePublish} />

      <MMHistoryLog open={showHistory} onOpenChange={setShowHistory} />
    </div>
  )
}
