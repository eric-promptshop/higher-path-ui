"use client"

import { useState } from "react"
import { Search, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function Header({ onSearch, searchQuery = "" }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = getItemCount()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">HP</span>
          </div>
          <span className="font-semibold text-foreground hidden sm:block">Higher Path</span>
        </div>

        {/* Search - Desktop */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {/* Cart Button */}
          <Button variant="ghost" size="icon" className="relative" onClick={toggleCart}>
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span
                className={cn(
                  "absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center",
                  "animate-in zoom-in-50 duration-200",
                )}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearch?.(e.target.value)}
              className="pl-10 bg-secondary border-0"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  )
}
