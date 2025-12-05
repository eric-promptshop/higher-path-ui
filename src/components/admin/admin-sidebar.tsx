"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  Users,
  BarChart3,
  Settings,
  Leaf,
  LogOut,
  Package,
  Percent,
  ChefHat,
} from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useMenuManagerStore } from "@/lib/menu-manager-store"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/chefs-choice", label: "Chef's Choice", icon: ChefHat },
  { href: "/admin/menu", label: "Menu", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { getPendingChangeCount } = useMenuManagerStore()
  const pendingChanges = getPendingChangeCount()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-card border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Higher Path</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const showBadge = item.href === "/admin/menu" && pendingChanges > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {showBadge && (
                <span
                  className={cn(
                    "absolute right-3 w-5 h-5 rounded-full text-xs flex items-center justify-center",
                    isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
                  )}
                >
                  {pendingChanges}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section with logout */}
      <div className="px-3 py-4 border-t border-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">{user?.name?.charAt(0) || "A"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name || "Admin"}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || "admin"}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  )
}
