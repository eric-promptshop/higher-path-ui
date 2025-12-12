"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/admin-header"
import { categories } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, ImageIcon, Loader2 } from "lucide-react"
import { createProduct } from "@/lib/api"
import { useMenuManagerStore } from "@/lib/menu-manager-store"

export default function NewProductPage() {
  const router = useRouter()
  const { addProduct } = useMenuManagerStore()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [inventory, setInventory] = useState("")
  const [lowStockThreshold, setLowStockThreshold] = useState("10")
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isValid = name && category && price && inventory

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    setError("")

    try {
      // Try API first
      await createProduct({
        name,
        category,
        description: description || undefined,
        price: parseFloat(price),
        inventory: parseInt(inventory),
        lowStockThreshold: parseInt(lowStockThreshold),
        active: isActive,
      })
      router.push("/admin/menu")
    } catch (err) {
      console.warn("API create failed, using local store:", err)
      // Fallback to local store
      addProduct({
        name,
        category,
        description: description || "",
        price: parseFloat(price),
        inventory: parseInt(inventory),
        image: "",
        lowStockThreshold: parseInt(lowStockThreshold),
        tags: isFeatured ? ["featured"] : [],
        active: isActive,
        featured: isFeatured,
      })
      router.push("/admin/menu")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AdminHeader title="Add Product" />

      <main className="p-4 lg:p-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/menu">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Add New Product</h1>
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
                    <Label htmlFor="inventory">Initial Inventory *</Label>
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
                      Creating...
                    </>
                  ) : (
                    "Publish Product"
                  )}
                </Button>
                <Button variant="outline" className="w-full bg-transparent" disabled={!isValid || isSubmitting}>
                  Save as Draft
                </Button>
                <Button variant="ghost" className="w-full" asChild disabled={isSubmitting}>
                  <Link href="/admin/menu">Cancel</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
