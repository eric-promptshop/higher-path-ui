"use client"

import { cn } from "@/lib/utils"
import { categories } from "@/lib/products"

interface CategoryTabsProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-30 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto">
        <nav className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all duration-200",
                activeCategory === category
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
