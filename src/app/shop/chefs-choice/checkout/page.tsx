"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays, addWeeks } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  useChefsChoiceStore,
  type SubscriptionFrequency,
} from "@/lib/chefs-choice-store"
import { useAuthStore } from "@/lib/auth-store"
import {
  ArrowLeft,
  ChefHat,
  CalendarDays,
  Truck,
  Zap,
  Check,
  CreditCard,
  Loader2,
} from "lucide-react"

type DeliveryMethod = "standard" | "express"
type PaymentMethod = "venmo" | "cashapp" | "zelle" | "cash"
type SubstitutionPreference = "allow" | "contact" | "cancel"

const steps = ["Frequency", "Delivery", "Payment", "Review"]

const frequencyOptions: {
  value: SubscriptionFrequency
  label: string
  description: string
}[] = [
  {
    value: "one-time",
    label: "One-Time Order",
    description: "Single delivery, no commitment",
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "Delivered every week",
  },
  {
    value: "biweekly",
    label: "Every 2 Weeks",
    description: "Delivered every other week",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "Delivered once a month",
  },
]

const deliveryOptions: {
  value: DeliveryMethod
  label: string
  description: string
  price: number
}[] = [
  {
    value: "standard",
    label: "Standard Delivery",
    description: "1-2 business days",
    price: 15,
  },
  {
    value: "express",
    label: "Express Delivery",
    description: "Same day (if before 2 PM)",
    price: 25,
  },
]

const paymentOptions: {
  value: PaymentMethod
  label: string
  description: string
}[] = [
  { value: "venmo", label: "Venmo", description: "@HigherPath" },
  { value: "cashapp", label: "Cash App", description: "$HigherPath" },
  { value: "zelle", label: "Zelle", description: "pay@higherpath.com" },
  { value: "cash", label: "Cash", description: "Pay on delivery" },
]

function ChefsChoiceCheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tierId = searchParams.get("tierId")

  const { user } = useAuthStore()
  const {
    getTierById,
    getCurrentTemplateForTier,
    createSubscription,
    createOrder,
  } = useChefsChoiceStore()

  // Get selected tier
  const tier = tierId ? getTierById(tierId) : null
  const template = tier ? getCurrentTemplateForTier(tier.id) : null

  // Redirect if no tier or user
  useEffect(() => {
    if (!tierId || !tier) {
      router.push("/shop/chefs-choice")
    }
    if (!user) {
      router.push("/login?redirect=/shop/chefs-choice")
    }
  }, [tierId, tier, user, router])

  // Form state
  const [currentStep, setCurrentStep] = useState(1)
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("one-time")
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("venmo")
  const [substitutionPreference, setSubstitutionPreference] =
    useState<SubstitutionPreference>("allow")
  const [notes, setNotes] = useState("")
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
  })
  const [saveAddress, setSaveAddress] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate totals
  const deliveryFee = deliveryMethod === "express" ? 25 : 15
  const subtotal = tier?.type === "dollar" ? tier.value : 0 // Volume tiers priced differently
  const total = subtotal + deliveryFee

  // Calculate next delivery date
  const nextDeliveryDate = useMemo(() => {
    const base = addDays(new Date(), 2) // Standard delivery is 1-2 days
    return base
  }, [])

  // Validation
  const isAddressComplete =
    address.line1.trim() &&
    address.city.trim() &&
    address.state.trim() &&
    address.zip.trim()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Handle place order
  const handlePlaceOrder = async () => {
    if (!tier || !template || !user) return

    setIsSubmitting(true)
    try {
      // Create subscription if recurring
      if (frequency !== "one-time") {
        const nextDate = addDays(new Date(), deliveryMethod === "express" ? 0 : 2)
        createSubscription({
          customerId: user.id,
          customerName: user.name,
          customerEmail: user.email,
          tierId: tier.id,
          tierType: tier.type,
          tierValue: tier.value,
          tierLabel: tier.label,
          frequency,
          nextDeliveryDate: nextDate.toISOString(),
          deliveryAddress: address,
          substitutionPreference,
          paymentMethod,
          notes: notes || undefined,
        })
      }

      // Create the order
      createOrder({
        subscriptionId: undefined,
        customerId: user.id,
        customerName: user.name,
        templateId: template.id,
        templateSnapshot: template,
        tierId: tier.id,
        tierLabel: tier.label,
        status: "pending",
        subtotal,
        deliveryFee,
        total,
        deliveryAddress: address,
        substitutionPreference,
        paymentMethod,
        notes: notes || undefined,
      })

      // Redirect to confirmation
      const orderId = Math.random().toString(36).substring(2, 8).toUpperCase()
      router.push(`/confirmation?orderId=CC-${orderId}&chefsChoice=true`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tier || !template) {
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
            onClick={() =>
              currentStep > 1
                ? setCurrentStep(currentStep - 1)
                : router.push("/shop/chefs-choice")
            }
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Chef&apos;s Choice Checkout
            </h1>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index + 1 === currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-0.5 mx-1 ${
                      index + 1 < currentStep ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            {steps.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Tier Summary */}
      <div className="bg-primary/5 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Selected</p>
            <p className="font-semibold">{tier.label}</p>
          </div>
          <Badge variant="secondary">{template.items.length} items</Badge>
        </div>
      </div>

      {/* Step Content */}
      <main className="pb-8">
        {/* Step 1: Frequency */}
        {currentStep === 1 && (
          <div className="space-y-6 p-4 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-semibold mb-4">Delivery Frequency</h2>
              <RadioGroup
                value={frequency}
                onValueChange={(v) => setFrequency(v as SubscriptionFrequency)}
                className="space-y-3"
              >
                {frequencyOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`freq-${option.value}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`freq-${option.value}`}
                    />
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    {option.value !== "one-time" && (
                      <Badge variant="secondary">Subscription</Badge>
                    )}
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Substitution Preference */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Substitution Preference
              </h2>
              <RadioGroup
                value={substitutionPreference}
                onValueChange={(v) =>
                  setSubstitutionPreference(v as SubstitutionPreference)
                }
                className="space-y-3"
              >
                <Label
                  htmlFor="sub-allow"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="allow" id="sub-allow" />
                  <div className="flex-1">
                    <span className="font-medium">Allow substitutions</span>
                    <p className="text-sm text-muted-foreground">
                      Substitute with similar items if unavailable
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="sub-contact"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="contact" id="sub-contact" />
                  <div className="flex-1">
                    <span className="font-medium">Contact me first</span>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll reach out before making substitutions
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="sub-cancel"
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                >
                  <RadioGroupItem value="cancel" id="sub-cancel" />
                  <div className="flex-1">
                    <span className="font-medium">No substitutions</span>
                    <p className="text-sm text-muted-foreground">
                      Remove unavailable items from order
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or preferences..."
                className="mt-2"
                rows={3}
              />
            </div>

            <Button
              onClick={() => setCurrentStep(2)}
              size="lg"
              className="w-full h-12 text-base"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Delivery */}
        {currentStep === 2 && (
          <div className="space-y-6 p-4 max-w-lg mx-auto">
            {/* Delivery Method */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Delivery Method</h2>
              <RadioGroup
                value={deliveryMethod}
                onValueChange={(v) => setDeliveryMethod(v as DeliveryMethod)}
                className="space-y-3"
              >
                {deliveryOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`del-${option.value}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`del-${option.value}`}
                    />
                    {option.value === "standard" ? (
                      <Truck className="h-5 w-5 text-primary" />
                    ) : (
                      <Zap className="h-5 w-5 text-primary" />
                    )}
                    <div className="flex-1">
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                    <span className="font-semibold">${option.price}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Delivery Address</h2>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="line1">Street Address</Label>
                  <Input
                    id="line1"
                    placeholder="123 Main Street"
                    value={address.line1}
                    onChange={(e) =>
                      setAddress({ ...address, line1: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="line2">
                    Apartment, suite, etc.{" "}
                    <span className="text-muted-foreground font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="line2"
                    placeholder="Apt 4B"
                    value={address.line2}
                    onChange={(e) =>
                      setAddress({ ...address, line2: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="San Francisco"
                      value={address.city}
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="CA"
                      value={address.state}
                      onChange={(e) =>
                        setAddress({ ...address, state: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div className="w-1/2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="94102"
                    value={address.zip}
                    onChange={(e) =>
                      setAddress({ ...address, zip: e.target.value })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="saveAddress"
                  checked={saveAddress}
                  onCheckedChange={(checked) =>
                    setSaveAddress(checked as boolean)
                  }
                />
                <Label
                  htmlFor="saveAddress"
                  className="text-sm font-normal cursor-pointer"
                >
                  Save this address for future orders
                </Label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                size="lg"
                className="h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                size="lg"
                className="flex-1 h-12 text-base"
                disabled={!isAddressComplete}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div className="space-y-6 p-4 max-w-lg mx-auto">
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                className="space-y-3"
              >
                {paymentOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`pay-${option.value}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`pay-${option.value}`}
                    />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <span className="font-medium">{option.label}</span>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                size="lg"
                className="h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                size="lg"
                className="flex-1 h-12 text-base"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6 p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-semibold">Review Your Order</h2>

            {/* Order Summary */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Tier */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ChefHat className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{tier.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {template.name}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">
                    {tier.type === "dollar"
                      ? formatCurrency(tier.value)
                      : `${tier.value}oz`}
                  </p>
                </div>

                {/* Items preview */}
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Includes:
                  </p>
                  <ul className="space-y-1 text-sm">
                    {template.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-500" />
                        {item.productName}
                        {item.notes && (
                          <span className="text-muted-foreground">
                            ({item.notes})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Frequency */}
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-muted-foreground">Frequency</span>
                  <span className="font-medium">
                    {frequencyOptions.find((f) => f.value === frequency)?.label}
                  </span>
                </div>

                {/* Delivery */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {deliveryMethod === "standard" ? "Standard" : "Express"} (
                    {formatCurrency(deliveryFee)})
                  </span>
                </div>

                {/* Address */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right text-sm">
                    {address.line1}
                    {address.line2 && `, ${address.line2}`}
                    <br />
                    {address.city}, {address.state} {address.zip}
                  </span>
                </div>

                {/* Payment */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>
                    {paymentOptions.find((p) => p.value === paymentMethod)?.label}
                  </span>
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  {tier.type === "dollar" && (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>{formatCurrency(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </>
                  )}
                  {tier.type === "volume" && (
                    <div className="text-center text-muted-foreground">
                      <p>Volume pricing - we&apos;ll confirm the total</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next delivery info */}
            {frequency !== "one-time" && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Subscription Info</p>
                      <p className="text-sm text-muted-foreground">
                        First delivery:{" "}
                        {format(nextDeliveryDate, "EEEE, MMMM d")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You can pause or cancel anytime
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(3)}
                size="lg"
                className="h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handlePlaceOrder}
                size="lg"
                className="flex-1 h-12 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  `Place Order${
                    tier.type === "dollar" ? ` • ${formatCurrency(total)}` : ""
                  }`
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

// Loading fallback for Suspense
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    </div>
  )
}

export default function ChefsChoiceCheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <ChefsChoiceCheckoutContent />
    </Suspense>
  )
}
