"use client"

import Link from "next/link"
import { ChefHat, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ChefsChoiceCard() {
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg group">
      {/* Image Area */}
      <Link
        href="/shop/chefs-choice"
        className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-secondary flex items-center justify-center"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <ChefHat className="w-10 h-10 text-primary" />
        </div>
        {/* Badge */}
        <div className="absolute top-2 left-2">
          <Badge className="text-xs bg-primary text-primary-foreground">
            Curated
          </Badge>
        </div>
      </Link>

      {/* Card Info */}
      <div className="p-3 space-y-2">
        <Link href="/shop/chefs-choice" className="text-left w-full block">
          <h3 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">
            Chef&apos;s Choice
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2">
          Curated selections starting at $50
        </p>

        {/* Action Button */}
        <div className="pt-1">
          <Button asChild size="sm" className="w-full gap-1.5">
            <Link href="/shop/chefs-choice">
              Explore
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
