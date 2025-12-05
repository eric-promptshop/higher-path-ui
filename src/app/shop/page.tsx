"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { CategoryTabs } from "@/components/category-tabs"
import { ProductGrid } from "@/components/product-grid"
import { ProductDetailSheet } from "@/components/product-detail-sheet"
import { CartSheet } from "@/components/cart-sheet"
import { FloatingCartButton } from "@/components/floating-cart-button"
import { products as demoProducts, categories } from "@/lib/products"
import { fetchProducts, type Product as ApiProduct } from "@/lib/api"
import type { Product } from "@/lib/store"
import { ChefHat, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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

        // Check if API products are usable (at least some have prices)
        const hasValidPrices = mappedProducts.some(p => p.price > 0)

        if (hasValidPrices) {
          setProducts(mappedProducts)
        } else {
          // API products have no prices, use demo data for better demo experience
          console.warn("API products have no prices, using demo data")
          setProducts(demoProducts)
        }
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

      {/* Chef's Choice Banner */}
      {activeCategory === "All" && !searchQuery && (
        <div className="px-4 pt-4">
          <Link href="/shop/chefs-choice">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-4 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Chef&apos;s Choice</h3>
                    <p className="text-sm text-muted-foreground">
                      Let us curate the perfect selection for you
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1 text-primary">
                  Explore
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Link>
        </div>
      )}

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
