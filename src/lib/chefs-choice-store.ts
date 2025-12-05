"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// ============ Types ============

export type TierType = "dollar" | "volume"
export type SubscriptionFrequency = "one-time" | "weekly" | "biweekly" | "monthly"
export type SubscriptionStatus = "active" | "paused" | "cancelled"

export interface ChefChoiceTier {
  id: string
  type: TierType
  value: number // e.g., 50, 100, 150 for dollars OR 1, 2, 4 for oz
  label: string // e.g., "$50 Box", "1oz Pack"
  description?: string
  active: boolean
  sortOrder: number
}

export interface ChefChoiceTemplateItem {
  productId: string
  productName: string
  quantity: number
  notes?: string
}

export interface ChefChoiceTemplate {
  id: string
  tierId: string
  name: string
  description?: string
  items: ChefChoiceTemplateItem[]
  effectiveFrom: string // ISO date string
  effectiveUntil?: string // null = current template
  active: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface ChefChoiceSubscription {
  id: string
  customerId: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  tierId: string
  tierType: TierType
  tierValue: number
  tierLabel: string
  frequency: SubscriptionFrequency
  status: SubscriptionStatus
  nextDeliveryDate?: string
  lastDeliveryDate?: string
  deliveryAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  substitutionPreference: "allow" | "contact" | "cancel"
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
  pausedAt?: string
  cancelledAt?: string
}

export interface ChefChoiceOrder {
  id: string
  orderNumber: string
  subscriptionId?: string // null for one-time orders
  customerId: string
  customerName: string
  templateId: string
  templateSnapshot: ChefChoiceTemplate
  tierId: string
  tierLabel: string
  status: "pending" | "confirmed" | "packed" | "ready" | "completed" | "cancelled"
  subtotal: number
  deliveryFee: number
  total: number
  deliveryAddress: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  substitutionPreference: "allow" | "contact" | "cancel"
  paymentMethod: string
  notes?: string
  actualItems?: ChefChoiceTemplateItem[]
  createdAt: string
  updatedAt: string
  fulfilledAt?: string
}

// ============ Store Interface ============

interface ChefsChoiceStore {
  // Data
  tiers: ChefChoiceTier[]
  templates: ChefChoiceTemplate[]
  subscriptions: ChefChoiceSubscription[]
  orders: ChefChoiceOrder[]

  // Admin: Tier Management
  addTier: (tier: Omit<ChefChoiceTier, "id">) => ChefChoiceTier
  updateTier: (id: string, updates: Partial<ChefChoiceTier>) => void
  deleteTier: (id: string) => void

  // Admin: Template Management
  addTemplate: (template: Omit<ChefChoiceTemplate, "id" | "createdAt" | "updatedAt">) => ChefChoiceTemplate
  updateTemplate: (id: string, updates: Partial<ChefChoiceTemplate>) => void
  deleteTemplate: (id: string) => void
  getCurrentTemplateForTier: (tierId: string) => ChefChoiceTemplate | undefined

  // Subscription Management
  createSubscription: (
    data: Omit<ChefChoiceSubscription, "id" | "createdAt" | "updatedAt" | "status">
  ) => ChefChoiceSubscription
  pauseSubscription: (id: string) => void
  resumeSubscription: (id: string) => void
  cancelSubscription: (id: string) => void
  updateSubscription: (id: string, updates: Partial<ChefChoiceSubscription>) => void

  // Orders
  createOrder: (data: Omit<ChefChoiceOrder, "id" | "orderNumber" | "createdAt" | "updatedAt">) => ChefChoiceOrder
  updateOrderStatus: (id: string, status: ChefChoiceOrder["status"]) => void

  // Getters
  getTierById: (id: string) => ChefChoiceTier | undefined
  getTemplateById: (id: string) => ChefChoiceTemplate | undefined
  getSubscriptionById: (id: string) => ChefChoiceSubscription | undefined
  getActiveTiers: () => ChefChoiceTier[]
  getDollarTiers: () => ChefChoiceTier[]
  getVolumeTiers: () => ChefChoiceTier[]
  getSubscriptionsByStatus: (status: SubscriptionStatus) => ChefChoiceSubscription[]
  getSubscriptionsByCustomer: (customerId: string) => ChefChoiceSubscription[]
  getOrdersByCustomer: (customerId: string) => ChefChoiceOrder[]
  getOrdersBySubscription: (subscriptionId: string) => ChefChoiceOrder[]
}

// ============ Demo Data ============

const demoTiers: ChefChoiceTier[] = [
  // Dollar tiers
  {
    id: "tier-dollar-50",
    type: "dollar",
    value: 50,
    label: "$50 Box",
    description: "Perfect for trying our curated selection",
    active: true,
    sortOrder: 1,
  },
  {
    id: "tier-dollar-100",
    type: "dollar",
    value: 100,
    label: "$100 Box",
    description: "Our most popular choice with premium variety",
    active: true,
    sortOrder: 2,
  },
  {
    id: "tier-dollar-150",
    type: "dollar",
    value: 150,
    label: "$150 Box",
    description: "The ultimate experience with top-shelf selections",
    active: true,
    sortOrder: 3,
  },
  // Volume tiers
  {
    id: "tier-volume-1oz",
    type: "volume",
    value: 1,
    label: "1oz Pack",
    description: "A curated ounce of our finest",
    active: true,
    sortOrder: 1,
  },
  {
    id: "tier-volume-2oz",
    type: "volume",
    value: 2,
    label: "2oz Pack",
    description: "Double the variety, double the enjoyment",
    active: true,
    sortOrder: 2,
  },
  {
    id: "tier-volume-4oz",
    type: "volume",
    value: 4,
    label: "4oz Pack",
    description: "Our premium bulk selection",
    active: true,
    sortOrder: 3,
  },
]

const demoTemplates: ChefChoiceTemplate[] = [
  {
    id: "template-dollar-50-dec",
    tierId: "tier-dollar-50",
    name: "December $50 Selection",
    description: "A festive mix of our seasonal favorites",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 3.5, notes: "1/8th oz" },
      { productId: "prod-2", productName: "Pre-Roll Pack", quantity: 3, notes: "3 pack" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "ryan",
  },
  {
    id: "template-dollar-100-dec",
    tierId: "tier-dollar-100",
    name: "December $100 Selection",
    description: "Premium holiday selection with variety",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 7, notes: "1/4 oz" },
      { productId: "prod-2", productName: "Pre-Roll Pack", quantity: 6, notes: "6 pack" },
      { productId: "prod-3", productName: "Gummies", quantity: 1, notes: "100mg pack" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "oriana",
  },
  {
    id: "template-dollar-150-dec",
    tierId: "tier-dollar-150",
    name: "December $150 Selection",
    description: "The ultimate curated experience",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 14, notes: "1/2 oz" },
      { productId: "prod-2", productName: "Pre-Roll Pack", quantity: 6, notes: "6 pack" },
      { productId: "prod-3", productName: "Gummies", quantity: 2, notes: "2x 100mg packs" },
      { productId: "prod-4", productName: "Vape Cartridge", quantity: 1, notes: "1g cart" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "ryan",
  },
  {
    id: "template-volume-1oz-dec",
    tierId: "tier-volume-1oz",
    name: "December 1oz Selection",
    description: "One ounce of curated excellence",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 14, notes: "1/2 oz" },
      { productId: "prod-5", productName: "Blue Dream", quantity: 14, notes: "1/2 oz" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "oriana",
  },
  {
    id: "template-volume-2oz-dec",
    tierId: "tier-volume-2oz",
    name: "December 2oz Selection",
    description: "Two ounces of premium variety",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 14, notes: "1/2 oz" },
      { productId: "prod-5", productName: "Blue Dream", quantity: 14, notes: "1/2 oz" },
      { productId: "prod-6", productName: "OG Kush", quantity: 14, notes: "1/2 oz" },
      { productId: "prod-7", productName: "Gelato", quantity: 14, notes: "1/2 oz" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "ryan",
  },
  {
    id: "template-volume-4oz-dec",
    tierId: "tier-volume-4oz",
    name: "December 4oz Selection",
    description: "Four ounces of our finest picks",
    items: [
      { productId: "prod-1", productName: "Purple Haze", quantity: 28, notes: "1 oz" },
      { productId: "prod-5", productName: "Blue Dream", quantity: 28, notes: "1 oz" },
      { productId: "prod-6", productName: "OG Kush", quantity: 28, notes: "1 oz" },
      { productId: "prod-7", productName: "Gelato", quantity: 28, notes: "1 oz" },
    ],
    effectiveFrom: "2024-12-01",
    active: true,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "oriana",
  },
]

const demoSubscriptions: ChefChoiceSubscription[] = [
  {
    id: "sub-1",
    customerId: "cust-1",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "555-123-4567",
    tierId: "tier-dollar-100",
    tierType: "dollar",
    tierValue: 100,
    tierLabel: "$100 Box",
    frequency: "monthly",
    status: "active",
    nextDeliveryDate: "2024-12-15",
    lastDeliveryDate: "2024-11-15",
    deliveryAddress: {
      line1: "123 Main St",
      city: "Los Angeles",
      state: "CA",
      zip: "90001",
    },
    substitutionPreference: "allow",
    paymentMethod: "venmo",
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
  },
  {
    id: "sub-2",
    customerId: "cust-2",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    tierId: "tier-volume-2oz",
    tierType: "volume",
    tierValue: 2,
    tierLabel: "2oz Pack",
    frequency: "biweekly",
    status: "active",
    nextDeliveryDate: "2024-12-10",
    lastDeliveryDate: "2024-11-26",
    deliveryAddress: {
      line1: "456 Oak Ave",
      line2: "Apt 2B",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
    },
    substitutionPreference: "contact",
    paymentMethod: "cashapp",
    createdAt: "2024-09-15T00:00:00Z",
    updatedAt: "2024-11-26T00:00:00Z",
  },
]

// ============ Helper Functions ============

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

function generateOrderNumber(): string {
  const prefix = "CC"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// ============ Store ============

export const useChefsChoiceStore = create<ChefsChoiceStore>()(
  persist(
    (set, get) => ({
      // Initial Data
      tiers: demoTiers,
      templates: demoTemplates,
      subscriptions: demoSubscriptions,
      orders: [],

      // Admin: Tier Management
      addTier: (tierData) => {
        const newTier: ChefChoiceTier = {
          ...tierData,
          id: generateId("tier"),
        }
        set((state) => ({
          tiers: [...state.tiers, newTier],
        }))
        return newTier
      },

      updateTier: (id, updates) => {
        set((state) => ({
          tiers: state.tiers.map((tier) => (tier.id === id ? { ...tier, ...updates } : tier)),
        }))
      },

      deleteTier: (id) => {
        set((state) => ({
          tiers: state.tiers.filter((tier) => tier.id !== id),
        }))
      },

      // Admin: Template Management
      addTemplate: (templateData) => {
        const now = new Date().toISOString()
        const newTemplate: ChefChoiceTemplate = {
          ...templateData,
          id: generateId("template"),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          templates: [...state.templates, newTemplate],
        }))
        return newTemplate
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id ? { ...template, ...updates, updatedAt: new Date().toISOString() } : template
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
        }))
      },

      getCurrentTemplateForTier: (tierId) => {
        const { templates } = get()
        const now = new Date().toISOString()
        return templates.find(
          (t) =>
            t.tierId === tierId &&
            t.active &&
            t.effectiveFrom <= now &&
            (!t.effectiveUntil || t.effectiveUntil > now)
        )
      },

      // Subscription Management
      createSubscription: (data) => {
        const now = new Date().toISOString()
        const newSubscription: ChefChoiceSubscription = {
          ...data,
          id: generateId("sub"),
          status: "active",
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          subscriptions: [...state.subscriptions, newSubscription],
        }))
        return newSubscription
      },

      pauseSubscription: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "paused" as const, pausedAt: now, updatedAt: now } : sub
          ),
        }))
      },

      resumeSubscription: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id
              ? { ...sub, status: "active" as const, pausedAt: undefined, updatedAt: now }
              : sub
          ),
        }))
      },

      cancelSubscription: (id) => {
        const now = new Date().toISOString()
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "cancelled" as const, cancelledAt: now, updatedAt: now } : sub
          ),
        }))
      },

      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
          ),
        }))
      },

      // Orders
      createOrder: (data) => {
        const now = new Date().toISOString()
        const newOrder: ChefChoiceOrder = {
          ...data,
          id: generateId("order"),
          orderNumber: generateOrderNumber(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          orders: [...state.orders, newOrder],
        }))
        return newOrder
      },

      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
          ),
        }))
      },

      // Getters
      getTierById: (id) => get().tiers.find((t) => t.id === id),

      getTemplateById: (id) => get().templates.find((t) => t.id === id),

      getSubscriptionById: (id) => get().subscriptions.find((s) => s.id === id),

      getActiveTiers: () => get().tiers.filter((t) => t.active),

      getDollarTiers: () =>
        get()
          .tiers.filter((t) => t.type === "dollar" && t.active)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      getVolumeTiers: () =>
        get()
          .tiers.filter((t) => t.type === "volume" && t.active)
          .sort((a, b) => a.sortOrder - b.sortOrder),

      getSubscriptionsByStatus: (status) => get().subscriptions.filter((s) => s.status === status),

      getSubscriptionsByCustomer: (customerId) =>
        get().subscriptions.filter((s) => s.customerId === customerId),

      getOrdersByCustomer: (customerId) => get().orders.filter((o) => o.customerId === customerId),

      getOrdersBySubscription: (subscriptionId) =>
        get().orders.filter((o) => o.subscriptionId === subscriptionId),
    }),
    {
      name: "higher-path-chefs-choice",
    }
  )
)
