"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { CategoryTabs } from "@/components/category-tabs"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetailSheet } from "@/components/product-detail-sheet"
import { CartSheet } from "@/components/cart-sheet"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { products as demoProducts, categories } from "@/lib/products"
import { fetchProducts, type Product as ApiProduct } from "@/lib/api"
import type { Product } from "@/lib/store"

// Default images by category for products without images
const categoryImages: Record<string, string> = {
  "Flowers": "/images/purple_cannabis_flower_jar.png",
  "Pre-Rolls": "/images/pre-rolled_joints_packaging.png",
  "Edibles": "/images/cannabis_edible_gummies_product.png",
  "Vapes": "/images/cannabis_concentrate_jar_product.png",
  "Concentrates": "/images/cannabis_concentrate_jar_product.png",
}

// Map API product to UI product format
function mapApiProduct(apiProduct: ApiProduct): Product {
  const price = parseFloat(apiProduct.basePrice) || 0
  const image = apiProduct.imageUrl || categoryImages[apiProduct.category] || "/images/purple_cannabis_flower_jar.png"

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price,
    description: apiProduct.description || "",
    image,
    category: apiProduct.category,
    inventory: apiProduct.stockQuantity ?? 0,
    featured: apiProduct.sortOrder <= 3, // First 3 products are featured
  }
}

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch products from API on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        const apiProducts = await fetchProducts()
        const mappedProducts = apiProducts.map(mapApiProduct)
        setProducts(mappedProducts)
      } catch (error) {
        console.error("Failed to fetch products, using demo data:", error)
        // Keep demo products as fallback
        setProducts(demoProducts)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

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
  }, [activeCategory, searchQuery, products])

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
      <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

      <main>
        <ProductGrid products={filteredProducts} onViewDetails={setSelectedProduct} isLoading={isLoading} />
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
