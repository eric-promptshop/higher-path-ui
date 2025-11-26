"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { StepOrderNotes } from "@/components/checkout/step-order-notes"
import { StepSubstitution } from "@/components/checkout/step-substitution"
import { StepDelivery } from "@/components/checkout/step-delivery"
import { StepReview } from "@/components/checkout/step-review"
import { useCartStore } from "@/lib/store"

const steps = ["Notes", "Substitution", "Delivery", "Review"]

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { items, clearCart, resetCheckoutData } = useCartStore()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/")
    }
  }, [items.length, router])

  const handlePlaceOrder = () => {
    // Generate order ID
    const orderId = Math.random().toString(36).substring(2, 8).toUpperCase()
    // Clear cart and checkout data
    clearCart()
    resetCheckoutData()
    // Navigate to confirmation
    router.push(`/confirmation?orderId=${orderId}`)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 h-16 max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.push("/"))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Checkout</h1>
        </div>
      </header>

      {/* Progress */}
      <CheckoutProgress currentStep={currentStep} steps={steps} />

      {/* Step Content */}
      <main className="pb-8">
        {currentStep === 1 && <StepOrderNotes onNext={() => setCurrentStep(2)} />}
        {currentStep === 2 && <StepSubstitution onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
        {currentStep === 3 && <StepDelivery onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
        {currentStep === 4 && <StepReview onBack={() => setCurrentStep(3)} onPlaceOrder={handlePlaceOrder} />}
      </main>
    </div>
  )
}
