import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  inventory: number
  featured?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}

export type SubstitutionPreference = "allow" | "contact" | "cancel"
export type DeliveryMethod = "standard" | "express"

export interface AppliedDiscount {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discountAmount: number
}

export interface CheckoutData {
  notes: string
  substitutionPreference: SubstitutionPreference
  deliveryMethod: DeliveryMethod
  address: {
    line1: string
    line2: string
    city: string
    state: string
    zip: string
  }
  saveAddress: boolean
  discount: AppliedDiscount | null
}

interface CartStore {
  items: CartItem[]
  isCartOpen: boolean
  checkoutData: CheckoutData
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  getTotal: () => number
  getItemCount: () => number
  setCheckoutData: (data: Partial<CheckoutData>) => void
  resetCheckoutData: () => void
}

const initialCheckoutData: CheckoutData = {
  notes: "",
  substitutionPreference: "contact",
  deliveryMethod: "standard",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  },
  saveAddress: false,
  discount: null,
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      checkoutData: initialCheckoutData,

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id)
          if (existingItem) {
            const newQuantity = Math.min(existingItem.quantity + quantity, product.inventory)
            return {
              items: state.items.map((item) =>
                item.product.id === product.id ? { ...item, quantity: newQuantity } : item,
              ),
              isCartOpen: true,
            }
          }
          return {
            items: [...state.items, { product, quantity: Math.min(quantity, product.inventory) }],
            isCartOpen: true,
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.product.id !== productId) }
          }
          return {
            items: state.items.map((item) =>
              item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.inventory) } : item,
            ),
          }
        })
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      setCheckoutData: (data) => {
        set((state) => ({
          checkoutData: { ...state.checkoutData, ...data },
        }))
      },

      resetCheckoutData: () => set({ checkoutData: initialCheckoutData }),
    }),
    {
      name: "higher-path-cart",
      partialize: (state) => ({ items: state.items, checkoutData: state.checkoutData }),
    },
  ),
)
