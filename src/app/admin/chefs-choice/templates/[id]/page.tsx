"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  useChefsChoiceStore,
  type ChefChoiceTemplateItem,
} from "@/lib/chefs-choice-store"
import { products as demoProducts } from "@/lib/products"
import { fetchProducts, type Product as ApiProduct } from "@/lib/api"
import type { Product } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Save,
  Loader2,
  Search,
} from "lucide-react"

// Map API product to UI format
function mapApiProduct(apiProduct: ApiProduct): Product {
  const price = parseFloat(apiProduct.price) || 0
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    price,
    description: apiProduct.description || "",
    image: apiProduct.imageUrl || "/images/purple_cannabis_flower_jar.png",
    category: apiProduct.category,
    inventory: apiProduct.inventory ?? 0,
    featured: false,
  }
}

export default function TemplateEditorPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = params.id as string
  const isNew = templateId === "new"
  const preselectedTierId = searchParams.get("tierId")

  const {
    tiers,
    templates,
    getTemplateById,
    addTemplate,
    updateTemplate,
  } = useChefsChoiceStore()

  // Products state
  const [products, setProducts] = useState<Product[]>(demoProducts)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tierId, setTierId] = useState("")
  const [effectiveFrom, setEffectiveFrom] = useState(
    format(new Date(), "yyyy-MM-dd")
  )
  const [items, setItems] = useState<ChefChoiceTemplateItem[]>([])
  const [isSaving, setIsSaving] = useState(false)

  // Product selector dialog
  const [showProductDialog, setShowProductDialog] = useState(false)
  const [productSearch, setProductSearch] = useState("")

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        const apiProducts = await fetchProducts()
        const mappedProducts = apiProducts.map(mapApiProduct)
        const hasValidPrices = mappedProducts.some((p) => p.price > 0)
        if (hasValidPrices) {
          setProducts(mappedProducts)
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  // Load existing template if editing
  useEffect(() => {
    if (!isNew) {
      const template = getTemplateById(templateId)
      if (template) {
        setName(template.name)
        setDescription(template.description || "")
        setTierId(template.tierId)
        setEffectiveFrom(template.effectiveFrom.split("T")[0])
        setItems(template.items)
      }
    } else if (preselectedTierId) {
      setTierId(preselectedTierId)
    }
  }, [templateId, isNew, getTemplateById, preselectedTierId])

  // Filtered products for dialog
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products
    const query = productSearch.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    )
  }, [products, productSearch])

  // Group products by category
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Product[]> = {}
    filteredProducts.forEach((p) => {
      if (!groups[p.category]) groups[p.category] = []
      groups[p.category].push(p)
    })
    return groups
  }, [filteredProducts])

  // Add product to template
  const addProduct = (product: Product) => {
    const existing = items.find((i) => i.productId === product.id)
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      )
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
        },
      ])
    }
  }

  // Update item quantity
  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setItems(
        items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      )
    }
  }

  // Update item notes
  const updateItemNotes = (productId: string, notes: string) => {
    setItems(
      items.map((i) =>
        i.productId === productId ? { ...i, notes: notes || undefined } : i
      )
    )
  }

  // Remove item
  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId))
  }

  // Get selected tier
  const selectedTier = tiers.find((t) => t.id === tierId)

  // Calculate total value (if products have prices)
  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId)
      return sum + (product?.price || 0) * item.quantity
    }, 0)
  }, [items, products])

  // Save template
  const handleSave = async () => {
    if (!name.trim() || !tierId || items.length === 0) return

    setIsSaving(true)
    try {
      if (isNew) {
        addTemplate({
          tierId,
          name: name.trim(),
          description: description.trim() || undefined,
          items,
          effectiveFrom: new Date(effectiveFrom).toISOString(),
          active: true,
          createdBy: "admin",
        })
      } else {
        updateTemplate(templateId, {
          tierId,
          name: name.trim(),
          description: description.trim() || undefined,
          items,
          effectiveFrom: new Date(effectiveFrom).toISOString(),
        })
      }
      router.push("/admin/chefs-choice")
    } finally {
      setIsSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title={isNew ? "New Template" : "Edit Template"} />

      <main className="p-4 lg:p-6 space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/chefs-choice")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Chef&apos;s Choice
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tier Selection */}
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier *</Label>
                  <Select value={tierId} onValueChange={setTierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers
                        .filter((t) => t.active)
                        .map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., December Holiday Box"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this template..."
                    rows={2}
                  />
                </div>

                {/* Effective From */}
                <div className="space-y-2">
                  <Label htmlFor="effectiveFrom">Effective From</Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    value={effectiveFrom}
                    onChange={(e) => setEffectiveFrom(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Products */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products in Template</CardTitle>
                <Button
                  onClick={() => setShowProductDialog(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No products added yet</p>
                    <p className="text-sm">
                      Add products to define what&apos;s included in this
                      template
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      )
                      return (
                        <div
                          key={item.productId}
                          className="flex items-start gap-4 p-3 border rounded-lg"
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.productName}</p>
                            {product && (
                              <p className="text-sm text-muted-foreground">
                                {product.category} •{" "}
                                {formatCurrency(product.price)} each
                              </p>
                            )}
                            {/* Notes input */}
                            <Input
                              className="mt-2"
                              placeholder="Add notes (e.g., 1/8th oz)"
                              value={item.notes || ""}
                              onChange={(e) =>
                                updateItemNotes(item.productId, e.target.value)
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity - 1
                                )
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                updateItemQuantity(
                                  item.productId,
                                  item.quantity + 1
                                )
                              }
                            >
                              +
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.productId)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTier ? (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="font-medium">{selectedTier.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTier.type === "dollar"
                        ? `Target: ${formatCurrency(selectedTier.value)}`
                        : `Target: ${selectedTier.value}oz`}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a tier above
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Products in template:
                    </span>
                    <span className="font-medium">{items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total items (qty):
                    </span>
                    <span className="font-medium">
                      {items.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                  </div>
                  {totalValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Estimated value:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Save button */}
                <Button
                  onClick={handleSave}
                  disabled={
                    !name.trim() || !tierId || items.length === 0 || isSaving
                  }
                  className="w-full gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isNew ? "Create Template" : "Save Changes"}
                </Button>
              </CardContent>
            </Card>

            {/* Validation */}
            {selectedTier && items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Validation</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTier.type === "dollar" ? (
                    <div>
                      {totalValue >= selectedTier.value ? (
                        <Badge className="bg-green-100 text-green-800">
                          Value meets tier target
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600">
                          Value below target (
                          {formatCurrency(selectedTier.value - totalValue)}{" "}
                          short)
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Badge variant="secondary">
                      Volume tiers validated manually
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Product Selector Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Products</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Products list */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {isLoadingProducts ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  Loading products...
                </p>
              </div>
            ) : (
              Object.entries(productsByCategory).map(
                ([category, categoryProducts]) => (
                  <div key={category}>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {categoryProducts.map((product) => {
                        const inTemplate = items.find(
                          (i) => i.productId === product.id
                        )
                        return (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                            </div>
                            {inTemplate ? (
                              <Badge variant="secondary">
                                In template ({inTemplate.quantity})
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => addProduct(product)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProductDialog(false)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
