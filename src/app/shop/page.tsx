"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { CategoryTabs } from "@/components/category-tabs"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetailSheet } from "@/components/product-detail-sheet"
import { CartSheet } from "@/components/cart-sheet"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { products } from "@/lib/products"
import type { Product } from "@/lib/store"

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filter by category
    if (activeCategory !== "All") {
      filtered = filtered.filter((p) => p.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main>
        <ProductGrid products={filteredProducts} onViewDetails={setSelectedProduct} />
      </main>

      <ProductDetailSheet
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartSheet />
      <FloatingCartButton />
    </div>
  )
}
