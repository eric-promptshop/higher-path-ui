"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { OrderSummaryCard } from "./order-summary-card"
import { useCartStore } from "@/lib/store"

interface StepOrderNotesProps {
  onNext: () => void
}

export function StepOrderNotes({ onNext }: StepOrderNotesProps) {
  const { checkoutData, setCheckoutData } = useCartStore()

  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      <OrderSummaryCard deliveryFee={15} collapsible />

      <div className="space-y-3">
        <Label htmlFor="notes" className="text-base font-medium">
          Order Notes <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="Special instructions, delivery notes, preferences..."
          value={checkoutData.notes}
          onChange={(e) => setCheckoutData({ notes: e.target.value })}
          className="min-h-[120px] resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{checkoutData.notes.length}/500 characters</p>
      </div>

      <Button onClick={onNext} size="lg" className="w-full h-12 text-base">
        Continue
      </Button>
    </div>
  )
}
