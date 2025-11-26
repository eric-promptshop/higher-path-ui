"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"
import { useMenuManagerStore } from "@/lib/menu-manager-store"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MMCategoryTabsProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function MMCategoryTabs({ selectedCategory, onSelectCategory }: MMCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { categories, products, showInactive } = useMenuManagerStore()

  const getProductCount = (categoryName: string) => {
    if (categoryName === "all") {
      return products.filter((p) => showInactive || p.active).length
    }
    const category = categories.find((c) => c.id === categoryName)
    if (!category) return 0
    return products.filter((p) => p.category === category.name && (showInactive || p.active)).length
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const allCategories = [
    { id: "all", name: "All Products", order: -1, active: true },
    ...categories.filter((c) => c.active).sort((a, b) => a.order - b.order),
  ]

  return (
    <div className="relative border-b border-border bg-background">
      {/* Scroll buttons - desktop only */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 bg-background shadow-sm"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide px-4 lg:px-10 gap-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {allCategories.map((category) => {
          const count = getProductCount(category.id)
          const isSelected = selectedCategory === category.id

          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
                isSelected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              {category.name}
              <span
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scroll buttons - desktop only */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex h-8 w-8 bg-background shadow-sm"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
