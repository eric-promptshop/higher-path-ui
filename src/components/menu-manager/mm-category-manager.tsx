"use client"

import { useState } from "react"
import { useMenuManagerStore, type MenuCategory } from "@/lib/menu-manager-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { GripVertical, Plus, Pencil, Trash2 } from "lucide-react"

interface MMCategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MMCategoryManager({ open, onOpenChange }: MMCategoryManagerProps) {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useMenuManagerStore()
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("")

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  const getProductCount = (categoryName: string) => {
    return products.filter((p) => p.category === categoryName).length
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory({
        name: newCategoryName.trim(),
        icon: newCategoryIcon || undefined,
        active: true,
      })
      setNewCategoryName("")
      setNewCategoryIcon("")
      setShowAddDialog(false)
    }
  }

  const handleDeleteCategory = (category: MenuCategory) => {
    const count = getProductCount(category.name)
    if (count > 0) {
      alert(`Cannot delete category with ${count} products. Move or delete the products first.`)
      return
    }
    if (window.confirm(`Delete "${category.name}" category?`)) {
      deleteCategory(category.id)
    }
  }

  const handleUpdateCategory = () => {
    if (editingCategory && editingCategory.name.trim()) {
      updateCategory(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon,
        active: editingCategory.active,
      })
      setEditingCategory(null)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
            <SheetDescription>Organize your product categories</SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <p className="text-sm text-muted-foreground mb-4">Drag to reorder how categories appear to customers</p>

            <div className="space-y-2">
              {sortedCategories.map((category) => (
                <div key={category.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      <span className="font-medium truncate">{category.name}</span>
                      <span className="text-xs text-muted-foreground">({getProductCount(category.name)})</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{category.active ? "Active" : "Hidden"}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setEditingCategory({ ...category })}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4 bg-transparent" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Concentrates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryIcon">Display Icon (Optional)</Label>
              <Input
                id="categoryIcon"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                placeholder="e.g., emoji or icon"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory}>Save Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="editCategoryName">Category Name *</Label>
                <Input
                  id="editCategoryName"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCategoryIcon">Display Icon</Label>
                <Input
                  id="editCategoryIcon"
                  value={editingCategory.icon || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  placeholder="e.g., emoji or icon"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="editCategoryActive">Active</Label>
                <Switch
                  id="editCategoryActive"
                  checked={editingCategory.active}
                  onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, active: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
