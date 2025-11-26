import { create } from "zustand"
import { persist } from "zustand/middleware"

export type DiscountType = "percentage" | "fixed"
export type DiscountStatus = "active" | "scheduled" | "expired" | "disabled"

export interface Discount {
  id: string
  code: string
  description: string
  type: DiscountType
  value: number // percentage (0-100) or fixed amount
  minOrderAmount?: number
  maxDiscount?: number // for percentage discounts
  usageLimit?: number
  usageCount: number
  perCustomerLimit?: number
  startDate: Date
  endDate?: Date
  applicableCategories?: string[] // empty = all categories
  applicableProducts?: string[] // empty = all products
  status: DiscountStatus
  createdAt: Date
  updatedAt: Date
}

interface DiscountsStore {
  discounts: Discount[]
  addDiscount: (discount: Omit<Discount, "id" | "usageCount" | "status" | "createdAt" | "updatedAt">) => void
  updateDiscount: (id: string, updates: Partial<Discount>) => void
  deleteDiscount: (id: string) => void
  toggleStatus: (id: string) => void
  getActiveDiscounts: () => Discount[]
  validateCode: (code: string, orderTotal: number) => { valid: boolean; discount?: Discount; error?: string }
}

// Calculate status based on dates and usage
const calculateStatus = (discount: Omit<Discount, "status">): DiscountStatus => {
  const now = new Date()
  const start = new Date(discount.startDate)
  const end = discount.endDate ? new Date(discount.endDate) : null

  if (end && now > end) return "expired"
  if (now < start) return "scheduled"
  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return "expired"
  return "active"
}

// Sample discounts
const sampleDiscounts: Discount[] = [
  {
    id: "1",
    code: "WELCOME10",
    description: "10% off for new customers",
    type: "percentage",
    value: 10,
    minOrderAmount: 50,
    maxDiscount: 25,
    usageLimit: 100,
    usageCount: 42,
    perCustomerLimit: 1,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-12-31"),
    status: "active",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    code: "FLOWER20",
    description: "$20 off flowers",
    type: "fixed",
    value: 20,
    minOrderAmount: 100,
    usageLimit: 50,
    usageCount: 12,
    startDate: new Date("2025-01-15"),
    endDate: new Date("2025-06-30"),
    applicableCategories: ["Flowers"],
    status: "active",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "3",
    code: "SUMMER25",
    description: "25% summer sale",
    type: "percentage",
    value: 25,
    minOrderAmount: 75,
    maxDiscount: 50,
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-31"),
    status: "scheduled",
    usageCount: 0,
    createdAt: new Date("2025-05-01"),
    updatedAt: new Date("2025-05-01"),
  },
  {
    id: "4",
    code: "FLASH15",
    description: "Flash sale 15% off",
    type: "percentage",
    value: 15,
    usageLimit: 25,
    usageCount: 25,
    startDate: new Date("2025-01-01"),
    endDate: new Date("2025-01-07"),
    status: "expired",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-07"),
  },
]

export const useDiscountsStore = create<DiscountsStore>()(
  persist(
    (set, get) => ({
      discounts: sampleDiscounts,

      addDiscount: (discount) => {
        const now = new Date()
        const partialDiscount = {
          ...discount,
          id: crypto.randomUUID(),
          usageCount: 0,
          createdAt: now,
          updatedAt: now,
        }
        const newDiscount: Discount = {
          ...partialDiscount,
          status: calculateStatus(partialDiscount),
        }
        set((state) => ({ discounts: [...state.discounts, newDiscount] }))
      },

      updateDiscount: (id, updates) => {
        set((state) => ({
          discounts: state.discounts.map((d) => {
            if (d.id !== id) return d
            const updated = { ...d, ...updates, updatedAt: new Date() }
            return { ...updated, status: calculateStatus(updated) }
          }),
        }))
      },

      deleteDiscount: (id) => {
        set((state) => ({ discounts: state.discounts.filter((d) => d.id !== id) }))
      },

      toggleStatus: (id) => {
        set((state) => ({
          discounts: state.discounts.map((d) => {
            if (d.id !== id) return d
            const newStatus = d.status === "disabled" ? calculateStatus(d) : "disabled"
            return { ...d, status: newStatus, updatedAt: new Date() }
          }),
        }))
      },

      getActiveDiscounts: () => {
        return get().discounts.filter((d) => d.status === "active")
      },

      validateCode: (code, orderTotal) => {
        const discount = get().discounts.find((d) => d.code.toUpperCase() === code.toUpperCase())

        if (!discount) {
          return { valid: false, error: "Invalid discount code" }
        }

        if (discount.status !== "active") {
          return { valid: false, error: "This discount code is no longer active" }
        }

        if (discount.minOrderAmount && orderTotal < discount.minOrderAmount) {
          return { valid: false, error: `Minimum order of $${discount.minOrderAmount} required` }
        }

        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
          return { valid: false, error: "This discount code has reached its usage limit" }
        }

        return { valid: true, discount }
      },
    }),
    {
      name: "higher-path-discounts",
    },
  ),
)
