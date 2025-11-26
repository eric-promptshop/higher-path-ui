"use client"

import { useState } from "react"
import { Bell, Menu, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Package, Boxes, Users, BarChart3, Settings, Leaf } from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Higher Path</span>
              </div>
              <nav className="px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        </div>

        {/* Right: Search + Notifications + User */}
        <div className="flex items-center gap-2">
          {/* Search (desktop) */}
          <div className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search orders, products..." className="pl-9 h-9" />
          </div>

          {/* Search (mobile) */}
          {isSearchOpen ? (
            <div className="flex md:hidden items-center gap-2 absolute inset-x-4 top-3 bg-background z-50">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9 h-10" autoFocus />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
              <Search className="w-5 h-5" />
            </Button>
          )}

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-3 border-b border-border">
                <p className="font-medium">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">New Order #12345</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">Low Stock Alert</p>
                  <p className="text-xs text-muted-foreground">Blue Dream - 5 units left</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">R</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
