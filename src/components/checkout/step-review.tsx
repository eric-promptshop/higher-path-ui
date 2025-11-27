"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { OrderSummaryCard } from "./order-summary-card"
import { useCartStore } from "@/lib/store"
import { ArrowLeft, MapPin, RefreshCw, MessageCircle, XCircle, FileText, Loader2 } from "lucide-react"

interface StepReviewProps {
  onBack: () => void
  onPlaceOrder: () => void
}

export function StepReview({ onBack, onPlaceOrder }: StepReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { checkoutData } = useCartStore()

  const deliveryFee = checkoutData.deliveryMethod === "express" ? 25 : 15

  const substitutionLabels = {
    allow: { label: "Allow substitutions", icon: <RefreshCw className="h-4 w-4" /> },
    contact: { label: "Contact me first", icon: <MessageCircle className="h-4 w-4" /> },
    cancel: { label: "Cancel unavailable items", icon: <XCircle className="h-4 w-4" /> },
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onPlaceOrder()
  }

  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-foreground">Review Your Order</h2>

      <OrderSummaryCard deliveryFee={deliveryFee} showDiscountInput={true} />

      {/* Delivery Address */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Delivery Address</h3>
            <p className="text-sm text-muted-foreground">
              {checkoutData.address.line1}
              {checkoutData.address.line2 && `, ${checkoutData.address.line2}`}
              <br />
              {checkoutData.address.city}, {checkoutData.address.state} {checkoutData.address.zip}
            </p>
            <p className="text-sm text-primary mt-1">
              {checkoutData.deliveryMethod === "express"
                ? "Express Delivery (Same day)"
                : "Standard Delivery (1-2 days)"}
            </p>
          </div>
        </div>
      </div>

      {/* Substitution Preference */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-start gap-3">
          {substitutionLabels[checkoutData.substitutionPreference].icon}
          <div>
            <h3 className="font-medium text-foreground mb-1">Substitution Preference</h3>
            <p className="text-sm text-muted-foreground">
              {substitutionLabels[checkoutData.substitutionPreference].label}
            </p>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      {checkoutData.notes && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground mb-1">Order Notes</h3>
              <p className="text-sm text-muted-foreground">{checkoutData.notes}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="h-12 bg-transparent" disabled={isSubmitting}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePlaceOrder} size="lg" className="flex-1 h-12 text-base" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>

      {isSubmitting && <p className="text-center text-sm text-muted-foreground">Please don&apos;t close this window</p>}
    </div>
  )
}
