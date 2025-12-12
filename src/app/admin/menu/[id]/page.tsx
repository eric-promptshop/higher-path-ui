"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { categories } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, ImageIcon, Loader2, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { fetchAdminProduct, updateProduct, deleteProduct, type Product } from "@/lib/api"
import { useMenuManagerStore } from "@/lib/menu-manager-store"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const { getProductById, updateProduct: localUpdate, deleteProduct: localDelete } = useMenuManagerStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isUsingDemoData, setIsUsingDemoData] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [inventory, setInventory] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState("10")
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadProduct() {
      try {
        const product = await fetchAdminProduct(productId)
        setName(product.name)
        setCategory(product.category)
        setDescription(product.description || "")
        setPrice(product.price)
        setInventory(product.inventory.toString())
        setIsActive(product.active)
        setIsFeatured(product.sortOrder <= 3)
        setIsUsingDemoData(false)
      } catch (err) {
        console.warn("Failed to fetch product from API, using local store:", err)
        // Fallback to local store
        const localProduct = getProductById(productId)
        if (localProduct) {
          setName(localProduct.name)
          setCategory(localProduct.category)
          setDescription(localProduct.description || "")
          setPrice(localProduct.price.toString())
          setInventory(localProduct.inventory.toString())
          setLowStockThreshold(localProduct.lowStockThreshold?.toString() || "10")
          setIsActive(localProduct.active)
          setIsFeatured(localProduct.featured)
          setIsUsingDemoData(true)
        } else {
          setError("Product not found")
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [productId, getProductById])

  const isValid = name && category && price && inventory

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    try {
      if (!isUsingDemoData) {
        await updateProduct(productId, {
          name,
          category,
          description: description || undefined,
          price: parseFloat(price),
          inventory: parseInt(inventory),
          active: isActive,
        })
      } else {
        localUpdate(productId, {
          name,
          category,
          description: description || "",
          price: parseFloat(price),
          inventory: parseInt(inventory),
          lowStockThreshold: parseInt(lowStockThreshold),
          active: isActive,
          featured: isFeatured,
        })
      }
      router.push("/admin/menu")
    } catch (err) {
      console.error("Failed to update product:", err)
      setError("Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      if (!isUsingDemoData) {
        await deleteProduct(productId)
      } else {
        localDelete(productId)
      }
      router.push("/admin/menu")
    } catch (err) {
      console.error("Failed to delete product:", err)
      setError("Failed to delete product")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Edit Product" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && !name) {
    return (
      <div className="min-h-screen">
        <AdminHeader title="Edit Product" />
        <main className="p-4 lg:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/menu">Back to Menu</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Edit Product" />

      <main className="p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/menu">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Edit Product</h1>
          {isUsingDemoData && (
            <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded">Demo Mode</span>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Product Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Blue Dream Premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Product Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Upload Image</p>
                      <p className="text-sm text-muted-foreground">Drag and drop or click to browse</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      <Upload className="w-4 h-4 mr-2" /> Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pricing & Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inventory">Current Inventory *</Label>
                    <Input
                      id="inventory"
                      type="number"
                      min="0"
                      value={inventory}
                      onChange={(e) => setInventory(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {isUsingDemoData && (
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Low Stock Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="0"
                      value={lowStockThreshold}
                      onChange={(e) => setLowStockThreshold(e.target.value)}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll be alerted when inventory falls below this number
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Active</p>
                    <p className="text-xs text-muted-foreground">Visible to customers</p>
                  </div>
                  <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Featured</p>
                    <p className="text-xs text-muted-foreground">Show at top of menu</p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <Button className="w-full" size="lg" disabled={!isValid || isSubmitting} onClick={handleSubmit}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button variant="ghost" className="w-full" asChild disabled={isSubmitting}>
                  <Link href="/admin/menu">Cancel</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Product
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the product
                        &quot;{name}&quot; from your menu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
