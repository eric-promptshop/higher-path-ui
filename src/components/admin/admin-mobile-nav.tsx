"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Package, MoreHorizontal, Percent } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Boxes, Users, BarChart3, Settings } from "lucide-react"
import { useMenuManagerStore } from "@/lib/menu-manager-store"

const mainNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: Package },
]

const moreNavItems = [
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/discounts", label: "Discounts", icon: Percent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

export function AdminMobileNav() {
  const pathname = usePathname()
  const { getPendingChangeCount } = useMenuManagerStore()
  const pendingChanges = getPendingChangeCount()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {mainNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          const showBadge = item.href === "/admin/menu" && pendingChanges > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] relative",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
              {showBadge && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {pendingChanges}
                </span>
              )}
            </Link>
          )
        })}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 min-w-[64px] text-muted-foreground">
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mb-2">
            {moreNavItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
