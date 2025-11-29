"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CheckoutProgress } from "@/components/checkout/checkout-progress"
import { StepOrderNotes } from "@/components/checkout/step-order-notes"
import { StepSubstitution } from "@/components/checkout/step-substitution"
import { StepDelivery } from "@/components/checkout/step-delivery"
import { StepPayment } from "@/components/checkout/step-payment"
import { StepReview } from "@/components/checkout/step-review"
import { PaymentInstructions } from "@/components/checkout/payment-instructions"
import { useCartStore } from "@/lib/store"

const steps = ["Notes", "Substitution", "Delivery", "Payment", "Review"]

export default function CheckoutPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const { items, checkoutData, clearCart, resetCheckoutData } = useCartStore()

  // Calculate total for payment
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [items])

  const deliveryFee = checkoutData.deliveryMethod === "express" ? 25 : 15
  const discountAmount = checkoutData.discount?.discountAmount || 0
  const total = subtotal + deliveryFee - discountAmount

  // Redirect if cart is empty (but not if showing payment instructions)
  useEffect(() => {
    if (items.length === 0 && !showPaymentInstructions) {
      router.push("/")
    }
  }, [items.length, router, showPaymentInstructions])

  const handlePlaceOrder = () => {
    // Generate order ID
    const orderId = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Check if payment method requires app payment
    if (checkoutData.paymentMethod !== "cash") {
      // Show payment instructions
      setPendingOrderId(orderId)
      setShowPaymentInstructions(true)
    } else {
      // Cash on delivery - go directly to confirmation
      clearCart()
      resetCheckoutData()
      router.push(`/confirmation?orderId=${orderId}`)
    }
  }

  const handlePaymentConfirmed = () => {
    // Clear cart and checkout data
    const paymentMethod = checkoutData.paymentMethod
    clearCart()
    resetCheckoutData()
    // Navigate to confirmation with payment pending status
    router.push(`/confirmation?orderId=${pendingOrderId}&paymentMethod=${paymentMethod}&paymentPending=true`)
  }

  const handleBackFromPayment = () => {
    setShowPaymentInstructions(false)
    setPendingOrderId(null)
  }

  // Show payment instructions screen
  if (showPaymentInstructions && pendingOrderId) {
    return (
      <PaymentInstructions
        paymentMethod={checkoutData.paymentMethod}
        amount={total.toFixed(2)}
        orderId={pendingOrderId}
        onPaymentConfirmed={handlePaymentConfirmed}
        onBack={handleBackFromPayment}
      />
    )
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
        {currentStep === 4 && <StepPayment onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />}
        {currentStep === 5 && <StepReview onBack={() => setCurrentStep(4)} onPlaceOrder={handlePlaceOrder} />}
      </main>
    </div>
  )
}
