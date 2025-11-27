"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore, type PaymentMethod } from "@/lib/store"
import { ArrowLeft, Banknote, Smartphone } from "lucide-react"

interface StepPaymentProps {
  onNext: () => void
  onBack: () => void
}

const paymentOptions: {
  value: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  color: string
}[] = [
  {
    value: "venmo",
    label: "Venmo",
    description: "Pay via Venmo app",
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-[#3D95CE]",
  },
  {
    value: "cashapp",
    label: "Cash App",
    description: "Pay via Cash App",
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-[#00D632]",
  },
  {
    value: "zelle",
    label: "Zelle",
    description: "Pay via Zelle transfer",
    icon: <Smartphone className="h-5 w-5" />,
    color: "text-[#6D1ED4]",
  },
  {
    value: "cash",
    label: "Cash on Delivery",
    description: "Pay with cash when your order arrives",
    icon: <Banknote className="h-5 w-5" />,
    color: "text-primary",
  },
]

export function StepPayment({ onNext, onBack }: StepPaymentProps) {
  const { checkoutData, setCheckoutData } = useCartStore()

  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Payment Method</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Select how you&apos;d like to pay for your order
        </p>
        <RadioGroup
          value={checkoutData.paymentMethod}
          onValueChange={(value) => setCheckoutData({ paymentMethod: value as PaymentMethod })}
          className="space-y-3"
        >
          {paymentOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={option.value}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span className={option.color}>{option.icon}</span>
              <div className="flex-1">
                <span className="font-medium text-foreground">{option.label}</span>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Note:</strong> For Venmo, Cash App, or Zelle payments,
          you&apos;ll receive payment instructions after placing your order.
        </p>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="h-12 bg-transparent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="flex-1 h-12 text-base">
          Continue
        </Button>
      </div>
    </div>
  )
}
