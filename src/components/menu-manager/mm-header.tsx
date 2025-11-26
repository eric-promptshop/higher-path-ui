"use client"

import { useState } from "react"
import { Search, Plus, Eye, User, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMenuManagerStore } from "@/lib/menu-manager-store"

interface MMHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: string
  onSortChange: (sort: string) => void
  onAddProduct: () => void
  onPreview: () => void
  onSettings: () => void
}

export function MMHeader({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  onAddProduct,
  onPreview,
  onSettings,
}: MMHeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const { showInactive, setShowInactive, bulkEditMode, setBulkEditMode } = useMenuManagerStore()

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HP</span>
            </div>
            <span className="font-semibold text-lg text-foreground">Menu Manager</span>
          </div>
          <div className="md:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HP</span>
            </div>
          </div>
        </div>

        {/* Desktop Search + Sort */}
        <div className="hidden md:flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="stock-low">Stock: Low to High</SelectItem>
              <SelectItem value="recent">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          <Button variant="outline" size="sm" onClick={onPreview} className="hidden sm:flex bg-transparent">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button size="sm" onClick={onAddProduct}>
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Add</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">VA Account</p>
                <p className="text-xs text-muted-foreground">va@higherpath.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSettings}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Toolbar Row */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
            <Label htmlFor="show-inactive" className="text-sm cursor-pointer">
              Show inactive
            </Label>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Switch id="bulk-edit" checked={bulkEditMode} onCheckedChange={setBulkEditMode} />
            <Label htmlFor="bulk-edit" className="text-sm cursor-pointer">
              Bulk edit
            </Label>
          </div>
        </div>

        {/* Mobile Sort */}
        <div className="md:hidden">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="price-low">Price: Low</SelectItem>
              <SelectItem value="price-high">Price: High</SelectItem>
              <SelectItem value="stock-low">Stock: Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
