import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "admin" | "manager" | "fulfillment" | "customer"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  rememberMe: boolean
  customerToken: string | null
  setUser: (user: User | null) => void
  setRememberMe: (remember: boolean) => void
  setCustomerToken: (token: string | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      rememberMe: true,
      customerToken: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setRememberMe: (rememberMe) => set({ rememberMe }),
      setCustomerToken: (token) => {
        // Also store in localStorage for API calls
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('customer_token', token)
          } else {
            localStorage.removeItem('customer_token')
          }
        }
        set({ customerToken: token })
      },
      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('customer_token')
          localStorage.removeItem('admin_token')
        }
        set({ user: null, isAuthenticated: false, customerToken: null })
      },
    }),
    {
      name: "hp-auth-storage",
    },
  ),
)

export const demoUsers: Record<string, { password: string; user: User }> = {
  "ryan@demo.com": {
    password: "demo123",
    user: {
      id: "1",
      email: "ryan@demo.com",
      name: "Ryan",
      role: "admin",
    },
  },
  "oriana@demo.com": {
    password: "demo123",
    user: {
      id: "2",
      email: "oriana@demo.com",
      name: "Oriana",
      role: "admin",
    },
  },
}

export const demoCustomerEmail = "customer@demo.com"

export const demoCustomer: User = {
  id: "100",
  email: "customer@demo.com",
  name: "Demo Customer",
  role: "customer",
}

// Valid access codes for demo
export const validAccessCodes = ["ABC-123-XYZ", "DEMO-2025", "WELCOME", "test"]

// Current rotating password (changes monthly in production)
export const currentPassword = {
  code: "FLOWER25",
  validUntil: "November 30, 2025",
}

export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "admin":
    case "manager":
      return "/admin"
    case "fulfillment":
      return "/admin/orders"
    case "customer":
    default:
      return "/shop"
  }
}
