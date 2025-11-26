import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product } from "./store"

// Order types
export type OrderStatus = "pending" | "confirmed" | "packed" | "ready" | "completed" | "cancelled"

export interface OrderItem {
  product: Product
  quantity: number
  priceAtTime: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: OrderStatus
  deliveryMethod: "standard" | "express"
  address: {
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
  }
  notes?: string
  substitutionPreference: "allow" | "contact" | "cancel"
  createdAt: Date
  updatedAt: Date
  statusHistory: { status: OrderStatus; timestamp: Date; by: string }[]
  internalNotes: { text: string; timestamp: Date; by: string }[]
}

// Inventory transaction types
export type TransactionType = "sale" | "restock" | "adjustment" | "return" | "damaged"

export interface InventoryTransaction {
  id: string
  productId: string
  productName: string
  type: TransactionType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  orderId?: string
  by: string
  timestamp: Date
}

// Activity types
export interface Activity {
  id: string
  type: "order_placed" | "order_updated" | "low_stock" | "product_added" | "product_updated"
  message: string
  timestamp: Date
  relatedId?: string
}

interface AdminStore {
  orders: Order[]
  inventoryTransactions: InventoryTransaction[]
  activities: Activity[]

  // Order actions
  addOrder: (order: Omit<Order, "id" | "createdAt" | "updatedAt" | "statusHistory">) => void
  updateOrderStatus: (orderId: string, status: OrderStatus, by: string) => void
  addInternalNote: (orderId: string, note: string, by: string) => void

  // Inventory actions
  adjustInventory: (
    productId: string,
    productName: string,
    quantity: number,
    type: TransactionType,
    reason: string,
    by: string,
    orderId?: string,
  ) => void

  // Activity actions
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void

  // Getters
  getOrderById: (id: string) => Order | undefined
  getOrdersByStatus: (status: OrderStatus) => Order[]
  getTodayOrders: () => Order[]
  getWeekOrders: () => Order[]
  getLowStockProducts: (products: Product[], threshold?: number) => Product[]
}

// Generate sample orders for demo
const generateSampleOrders = (): Order[] => {
  const now = new Date()
  const statuses: OrderStatus[] = ["pending", "confirmed", "packed", "ready", "completed"]

  return [
    {
      id: "12345",
      customerId: "789",
      customerName: "Customer #789",
      customerPhone: "(555) 123-4567",
      items: [
        {
          product: {
            id: "3",
            name: "Blue Dream",
            price: 42,
            description: "",
            image: "",
            category: "Flowers",
            inventory: 5,
          },
          quantity: 2,
          priceAtTime: 42,
        },
        {
          product: {
            id: "5",
            name: "Classic Pre-Roll Pack",
            price: 25,
            description: "",
            image: "",
            category: "Pre-Rolls",
            inventory: 30,
          },
          quantity: 1,
          priceAtTime: 25,
        },
      ],
      subtotal: 109,
      deliveryFee: 15,
      total: 124,
      status: "pending",
      deliveryMethod: "standard",
      address: { line1: "123 Main St", line2: "Apt 4B", city: "Austin", state: "TX", zip: "78701" },
      notes: "Please ring doorbell twice",
      substitutionPreference: "contact",
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      statusHistory: [{ status: "pending", timestamp: new Date(now.getTime() - 30 * 60 * 1000), by: "System" }],
      internalNotes: [],
    },
    {
      id: "12344",
      customerId: "456",
      customerName: "John Smith",
      customerPhone: "(555) 987-6543",
      items: [
        {
          product: {
            id: "1",
            name: "Purple Haze Premium",
            price: 45,
            description: "",
            image: "",
            category: "Flowers",
            inventory: 25,
          },
          quantity: 2,
          priceAtTime: 45,
        },
      ],
      subtotal: 90,
      deliveryFee: 15,
      total: 105,
      status: "confirmed",
      deliveryMethod: "standard",
      address: { line1: "456 Oak Ave", city: "Austin", state: "TX", zip: "78702" },
      substitutionPreference: "allow",
      createdAt: new Date(now.getTime() - 75 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 60 * 60 * 1000),
      statusHistory: [
        { status: "pending", timestamp: new Date(now.getTime() - 75 * 60 * 1000), by: "System" },
        { status: "confirmed", timestamp: new Date(now.getTime() - 60 * 60 * 1000), by: "Ryan" },
      ],
      internalNotes: [],
    },
    {
      id: "12343",
      customerId: "123",
      customerName: "Customer #123",
      customerPhone: "(555) 555-5555",
      items: [
        {
          product: {
            id: "7",
            name: "Gummy Bears 100mg",
            price: 30,
            description: "",
            image: "",
            category: "Edibles",
            inventory: 22,
          },
          quantity: 3,
          priceAtTime: 30,
        },
        {
          product: {
            id: "10",
            name: "Sativa Vape Cart",
            price: 55,
            description: "",
            image: "",
            category: "Vapes",
            inventory: 15,
          },
          quantity: 2,
          priceAtTime: 55,
        },
      ],
      subtotal: 200,
      deliveryFee: 15,
      total: 215,
      status: "packed",
      deliveryMethod: "standard",
      address: { line1: "789 Pine St", city: "Austin", state: "TX", zip: "78703" },
      substitutionPreference: "cancel",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      statusHistory: [
        { status: "pending", timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), by: "System" },
        { status: "confirmed", timestamp: new Date(now.getTime() - 2.5 * 60 * 60 * 1000), by: "Ryan" },
        { status: "packed", timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), by: "Ryan" },
      ],
      internalNotes: [
        {
          text: "Customer prefers morning deliveries",
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          by: "Ryan",
        },
      ],
    },
    {
      id: "12342",
      customerId: "789",
      customerName: "Customer #789",
      customerPhone: "(555) 123-4567",
      items: [
        {
          product: {
            id: "4",
            name: "OG Kush",
            price: 50,
            description: "",
            image: "",
            category: "Flowers",
            inventory: 12,
          },
          quantity: 3,
          priceAtTime: 50,
        },
        {
          product: {
            id: "8",
            name: "Chocolate Bar 200mg",
            price: 40,
            description: "",
            image: "",
            category: "Edibles",
            inventory: 8,
          },
          quantity: 1,
          priceAtTime: 40,
        },
      ],
      subtotal: 190,
      deliveryFee: 15,
      total: 205,
      status: "ready",
      deliveryMethod: "express",
      address: { line1: "123 Main St", line2: "Apt 4B", city: "Austin", state: "TX", zip: "78701" },
      notes: "Leave at door",
      substitutionPreference: "contact",
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
      statusHistory: [
        { status: "pending", timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), by: "System" },
        { status: "confirmed", timestamp: new Date(now.getTime() - 3.5 * 60 * 60 * 1000), by: "Ryan" },
        { status: "packed", timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), by: "Ryan" },
        { status: "ready", timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000), by: "Ryan" },
      ],
      internalNotes: [],
    },
    {
      id: "12341",
      customerId: "321",
      customerName: "Sarah Johnson",
      customerPhone: "(555) 222-3333",
      items: [
        {
          product: {
            id: "2",
            name: "Northern Lights",
            price: 40,
            description: "",
            image: "",
            category: "Flowers",
            inventory: 18,
          },
          quantity: 1,
          priceAtTime: 40,
        },
      ],
      subtotal: 40,
      deliveryFee: 15,
      total: 55,
      status: "completed",
      deliveryMethod: "standard",
      address: { line1: "321 Elm St", city: "Austin", state: "TX", zip: "78704" },
      substitutionPreference: "allow",
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      statusHistory: [
        { status: "pending", timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), by: "System" },
        { status: "confirmed", timestamp: new Date(now.getTime() - 23 * 60 * 60 * 1000), by: "Ryan" },
        { status: "packed", timestamp: new Date(now.getTime() - 22 * 60 * 60 * 1000), by: "Ryan" },
        { status: "ready", timestamp: new Date(now.getTime() - 21 * 60 * 60 * 1000), by: "Ryan" },
        { status: "completed", timestamp: new Date(now.getTime() - 20 * 60 * 60 * 1000), by: "Ryan" },
      ],
      internalNotes: [],
    },
  ]
}

const generateSampleActivities = (): Activity[] => {
  const now = new Date()
  return [
    {
      id: "1",
      type: "order_placed",
      message: "Order #12345 placed",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000),
      relatedId: "12345",
    },
    {
      id: "2",
      type: "low_stock",
      message: 'Product "Blue Dream" low stock',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      relatedId: "3",
    },
    {
      id: "3",
      type: "order_updated",
      message: "Order #12344 confirmed by Ryan",
      timestamp: new Date(now.getTime() - 60 * 60 * 1000),
      relatedId: "12344",
    },
    {
      id: "4",
      type: "order_updated",
      message: "Order #12343 packed by Ryan",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      relatedId: "12343",
    },
    {
      id: "5",
      type: "order_placed",
      message: "Order #12342 placed",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      relatedId: "12342",
    },
  ]
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      orders: generateSampleOrders(),
      inventoryTransactions: [],
      activities: generateSampleActivities(),

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: Math.random().toString(36).substr(2, 5).toUpperCase(),
          createdAt: new Date(),
          updatedAt: new Date(),
          statusHistory: [{ status: orderData.status, timestamp: new Date(), by: "System" }],
        }
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }))
        get().addActivity({ type: "order_placed", message: `Order #${newOrder.id} placed`, relatedId: newOrder.id })
      },

      updateOrderStatus: (orderId, status, by) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date(),
                  statusHistory: [...order.statusHistory, { status, timestamp: new Date(), by }],
                }
              : order,
          ),
        }))
        get().addActivity({
          type: "order_updated",
          message: `Order #${orderId} ${status} by ${by}`,
          relatedId: orderId,
        })
      },

      addInternalNote: (orderId, note, by) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  updatedAt: new Date(),
                  internalNotes: [...order.internalNotes, { text: note, timestamp: new Date(), by }],
                }
              : order,
          ),
        }))
      },

      adjustInventory: (productId, productName, quantity, type, reason, by, orderId) => {
        const transaction: InventoryTransaction = {
          id: Math.random().toString(36).substr(2, 9),
          productId,
          productName,
          type,
          quantity,
          previousQuantity: 0,
          newQuantity: 0,
          reason,
          orderId,
          by,
          timestamp: new Date(),
        }
        set((state) => ({
          inventoryTransactions: [transaction, ...state.inventoryTransactions],
        }))
      },

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
        }
        set((state) => ({
          activities: [newActivity, ...state.activities].slice(0, 50),
        }))
      },

      getOrderById: (id) => get().orders.find((o) => o.id === id),

      getOrdersByStatus: (status) => get().orders.filter((o) => o.status === status),

      getTodayOrders: () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return get().orders.filter((o) => new Date(o.createdAt) >= today)
      },

      getWeekOrders: () => {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return get().orders.filter((o) => new Date(o.createdAt) >= weekAgo)
      },

      getLowStockProducts: (products, threshold = 10) =>
        products.filter((p) => p.inventory <= threshold && p.inventory > 0),
    }),
    {
      name: "higher-path-admin",
      partialize: (state) => ({ orders: state.orders, inventoryTransactions: state.inventoryTransactions }),
    },
  ),
)
