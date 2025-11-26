import { create } from "zustand"
import { persist } from "zustand/middleware"
import { products as initialProducts, categories as initialCategories } from "./products"

export interface MenuProduct {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  subcategory?: string
  inventory: number
  lowStockThreshold: number
  sku: string
  tags: string[]
  active: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MenuCategory {
  id: string
  name: string
  icon?: string
  parentId?: string
  order: number
  active: boolean
}

export interface PendingChange {
  id: string
  productId: string
  productName: string
  type: "inventory" | "price" | "details" | "new" | "delete" | "status"
  before: string
  after: string
  timestamp: Date
}

export interface PublishLog {
  id: string
  changes: PendingChange[]
  publishedAt: Date
  publishedBy: string
}

interface MenuManagerStore {
  products: MenuProduct[]
  categories: MenuCategory[]
  pendingChanges: PendingChange[]
  publishLogs: PublishLog[]
  bulkEditMode: boolean
  selectedProducts: string[]
  showInactive: boolean

  // Product actions
  updateProduct: (id: string, updates: Partial<MenuProduct>) => void
  addProduct: (product: Omit<MenuProduct, "id" | "createdAt" | "updatedAt" | "sku">) => void
  deleteProduct: (id: string) => void
  duplicateProduct: (id: string) => void
  reorderProducts: (categoryId: string, productIds: string[]) => void

  // Inventory actions
  adjustStock: (id: string, amount: number, type: "add" | "remove" | "set") => void

  // Category actions
  addCategory: (category: Omit<MenuCategory, "id" | "order">) => void
  updateCategory: (id: string, updates: Partial<MenuCategory>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (categoryIds: string[]) => void

  // Bulk actions
  setBulkEditMode: (enabled: boolean) => void
  toggleProductSelection: (id: string) => void
  selectAllProducts: () => void
  clearSelection: () => void
  bulkUpdateStock: (amount: number, type: "add" | "remove" | "set") => void
  bulkUpdatePrice: (
    amount: number,
    type: "percent_increase" | "percent_decrease" | "amount_increase" | "amount_decrease" | "set",
  ) => void
  bulkSetActive: (active: boolean) => void
  bulkDelete: () => void

  // Publish actions
  discardChanges: () => void
  publishMenu: (publishedBy: string) => void
  getPendingChangeCount: () => number

  // View actions
  setShowInactive: (show: boolean) => void

  // Getters
  getProductsByCategory: (categoryId: string) => MenuProduct[]
  getProductById: (id: string) => MenuProduct | undefined
  getLowStockProducts: () => MenuProduct[]
  getOutOfStockProducts: () => MenuProduct[]
}

// Convert initial products to MenuProducts
const convertToMenuProducts = (): MenuProduct[] => {
  return initialProducts.map((p, index) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    image: p.image,
    category: p.category,
    inventory: p.inventory,
    lowStockThreshold: 10,
    sku: `HP-${p.category.substring(0, 3).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    tags: p.featured ? ["featured"] : [],
    active: true,
    featured: p.featured || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
}

// Convert initial categories
const convertToMenuCategories = (): MenuCategory[] => {
  return initialCategories
    .filter((c) => c !== "All")
    .map((name, index) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      order: index,
      active: true,
    }))
}

const generateSku = (category: string, products: MenuProduct[]): string => {
  const prefix = `HP-${category.substring(0, 3).toUpperCase()}`
  const existingNumbers = products
    .filter((p) => p.sku.startsWith(prefix))
    .map((p) => Number.parseInt(p.sku.split("-")[2] || "0"))
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1
  return `${prefix}-${String(nextNumber).padStart(3, "0")}`
}

export const useMenuManagerStore = create<MenuManagerStore>()(
  persist(
    (set, get) => ({
      products: convertToMenuProducts(),
      categories: convertToMenuCategories(),
      pendingChanges: [],
      publishLogs: [],
      bulkEditMode: false,
      selectedProducts: [],
      showInactive: false,

      updateProduct: (id, updates) => {
        const product = get().products.find((p) => p.id === id)
        if (!product) return

        const changes: PendingChange[] = []

        if (updates.inventory !== undefined && updates.inventory !== product.inventory) {
          changes.push({
            id: crypto.randomUUID(),
            productId: id,
            productName: product.name,
            type: "inventory",
            before: String(product.inventory),
            after: String(updates.inventory),
            timestamp: new Date(),
          })
        }

        if (updates.price !== undefined && updates.price !== product.price) {
          changes.push({
            id: crypto.randomUUID(),
            productId: id,
            productName: product.name,
            type: "price",
            before: `$${product.price.toFixed(2)}`,
            after: `$${updates.price.toFixed(2)}`,
            timestamp: new Date(),
          })
        }

        if (updates.active !== undefined && updates.active !== product.active) {
          changes.push({
            id: crypto.randomUUID(),
            productId: id,
            productName: product.name,
            type: "status",
            before: product.active ? "Active" : "Inactive",
            after: updates.active ? "Active" : "Inactive",
            timestamp: new Date(),
          })
        }

        if (updates.name !== undefined || updates.description !== undefined || updates.category !== undefined) {
          changes.push({
            id: crypto.randomUUID(),
            productId: id,
            productName: product.name,
            type: "details",
            before: "Details",
            after: "Updated",
            timestamp: new Date(),
          })
        }

        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)),
          pendingChanges: [
            ...state.pendingChanges.filter((c) => !(c.productId === id && changes.some((nc) => nc.type === c.type))),
            ...changes,
          ],
        }))
      },

      addProduct: (product) => {
        const id = crypto.randomUUID()
        const sku = generateSku(product.category, get().products)
        const newProduct: MenuProduct = {
          ...product,
          id,
          sku,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          products: [...state.products, newProduct],
          pendingChanges: [
            ...state.pendingChanges,
            {
              id: crypto.randomUUID(),
              productId: id,
              productName: product.name,
              type: "new",
              before: "",
              after: "New product",
              timestamp: new Date(),
            },
          ],
        }))
      },

      deleteProduct: (id) => {
        const product = get().products.find((p) => p.id === id)
        if (!product) return

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          pendingChanges: [
            ...state.pendingChanges,
            {
              id: crypto.randomUUID(),
              productId: id,
              productName: product.name,
              type: "delete",
              before: product.name,
              after: "Deleted",
              timestamp: new Date(),
            },
          ],
          selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
        }))
      },

      duplicateProduct: (id) => {
        const product = get().products.find((p) => p.id === id)
        if (!product) return

        const newId = crypto.randomUUID()
        const sku = generateSku(product.category, get().products)
        const duplicated: MenuProduct = {
          ...product,
          id: newId,
          name: `${product.name} (Copy)`,
          sku,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          products: [...state.products, duplicated],
          pendingChanges: [
            ...state.pendingChanges,
            {
              id: crypto.randomUUID(),
              productId: newId,
              productName: duplicated.name,
              type: "new",
              before: "",
              after: "Duplicated from " + product.name,
              timestamp: new Date(),
            },
          ],
        }))
      },

      reorderProducts: (categoryId, productIds) => {
        set((state) => ({
          products: state.products.map((p) => {
            const index = productIds.indexOf(p.id)
            if (index === -1) return p
            return { ...p, updatedAt: new Date() }
          }),
        }))
      },

      adjustStock: (id, amount, type) => {
        const product = get().products.find((p) => p.id === id)
        if (!product) return

        let newInventory: number
        switch (type) {
          case "add":
            newInventory = product.inventory + amount
            break
          case "remove":
            newInventory = Math.max(0, product.inventory - amount)
            break
          case "set":
            newInventory = Math.max(0, amount)
            break
        }

        get().updateProduct(id, { inventory: newInventory })
      },

      addCategory: (category) => {
        const id = crypto.randomUUID()
        const order = get().categories.length
        set((state) => ({
          categories: [...state.categories, { ...category, id, order }],
        }))
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
      },

      reorderCategories: (categoryIds) => {
        set((state) => ({
          categories: state.categories.map((c) => {
            const index = categoryIds.indexOf(c.id)
            return index === -1 ? c : { ...c, order: index }
          }),
        }))
      },

      setBulkEditMode: (enabled) => {
        set({ bulkEditMode: enabled, selectedProducts: enabled ? [] : [] })
      },

      toggleProductSelection: (id) => {
        set((state) => ({
          selectedProducts: state.selectedProducts.includes(id)
            ? state.selectedProducts.filter((pid) => pid !== id)
            : [...state.selectedProducts, id],
        }))
      },

      selectAllProducts: () => {
        set((state) => ({
          selectedProducts: state.products.filter((p) => state.showInactive || p.active).map((p) => p.id),
        }))
      },

      clearSelection: () => {
        set({ selectedProducts: [] })
      },

      bulkUpdateStock: (amount, type) => {
        const { selectedProducts, adjustStock } = get()
        selectedProducts.forEach((id) => adjustStock(id, amount, type))
      },

      bulkUpdatePrice: (amount, type) => {
        const { selectedProducts, products, updateProduct } = get()
        selectedProducts.forEach((id) => {
          const product = products.find((p) => p.id === id)
          if (!product) return

          let newPrice: number
          switch (type) {
            case "percent_increase":
              newPrice = product.price * (1 + amount / 100)
              break
            case "percent_decrease":
              newPrice = product.price * (1 - amount / 100)
              break
            case "amount_increase":
              newPrice = product.price + amount
              break
            case "amount_decrease":
              newPrice = Math.max(0, product.price - amount)
              break
            case "set":
              newPrice = amount
              break
          }
          updateProduct(id, { price: Math.round(newPrice * 100) / 100 })
        })
      },

      bulkSetActive: (active) => {
        const { selectedProducts, updateProduct } = get()
        selectedProducts.forEach((id) => updateProduct(id, { active }))
      },

      bulkDelete: () => {
        const { selectedProducts, deleteProduct } = get()
        selectedProducts.forEach((id) => deleteProduct(id))
        set({ selectedProducts: [] })
      },

      discardChanges: () => {
        set({
          products: convertToMenuProducts(),
          pendingChanges: [],
        })
      },

      publishMenu: (publishedBy) => {
        const pendingChanges = get().pendingChanges
        if (pendingChanges.length === 0) return

        const log: PublishLog = {
          id: crypto.randomUUID(),
          changes: pendingChanges,
          publishedAt: new Date(),
          publishedBy,
        }

        set((state) => ({
          publishLogs: [log, ...state.publishLogs].slice(0, 50),
          pendingChanges: [],
        }))
      },

      getPendingChangeCount: () => get().pendingChanges.length,

      setShowInactive: (show) => {
        set({ showInactive: show })
      },

      getProductsByCategory: (categoryId) => {
        const { products, showInactive } = get()
        const category = get().categories.find((c) => c.id === categoryId)
        if (!category) return []
        return products.filter((p) => p.category === category.name && (showInactive || p.active))
      },

      getProductById: (id) => get().products.find((p) => p.id === id),

      getLowStockProducts: () => {
        return get().products.filter((p) => p.inventory > 0 && p.inventory <= p.lowStockThreshold)
      },

      getOutOfStockProducts: () => {
        return get().products.filter((p) => p.inventory === 0)
      },
    }),
    {
      name: "higher-path-menu-manager",
      partialize: (state) => ({
        products: state.products,
        categories: state.categories,
        publishLogs: state.publishLogs,
      }),
    },
  ),
)
