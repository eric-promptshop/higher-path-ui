"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useCartStore, type DeliveryMethod } from "@/lib/store"
import { ArrowLeft, Truck, Zap } from "lucide-react"

interface StepDeliveryProps {
  onNext: () => void
  onBack: () => void
}

const deliveryOptions: {
  value: DeliveryMethod
  label: string
  description: string
  price: number
  icon: React.ReactNode
}[] = [
  {
    value: "standard",
    label: "Standard Delivery",
    description: "1-2 business days",
    price: 15,
    icon: <Truck className="h-5 w-5" />,
  },
  {
    value: "express",
    label: "Express Delivery",
    description: "Same day (if before 2 PM)",
    price: 25,
    icon: <Zap className="h-5 w-5" />,
  },
]

export function StepDelivery({ onNext, onBack }: StepDeliveryProps) {
  const { checkoutData, setCheckoutData } = useCartStore()

  const updateAddress = (field: string, value: string) => {
    setCheckoutData({
      address: { ...checkoutData.address, [field]: value },
    })
  }

  const isAddressComplete =
    checkoutData.address.line1.trim() &&
    checkoutData.address.city.trim() &&
    checkoutData.address.state.trim() &&
    checkoutData.address.zip.trim()

  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      {/* Delivery Method */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Delivery Method</h2>
        <RadioGroup
          value={checkoutData.deliveryMethod}
          onValueChange={(value) => setCheckoutData({ deliveryMethod: value as DeliveryMethod })}
          className="space-y-3"
        >
          {deliveryOptions.map((option) => (
            <Label
              key={option.value}
              htmlFor={option.value}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
            >
              <RadioGroupItem value={option.value} id={option.value} />
              <span className="text-primary">{option.icon}</span>
              <div className="flex-1">
                <span className="font-medium text-foreground">{option.label}</span>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
              <span className="font-semibold text-foreground">${option.price}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Delivery Address */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Delivery Address</h2>

        <div className="space-y-3">
          <div>
            <Label htmlFor="line1">Street Address</Label>
            <Input
              id="line1"
              placeholder="123 Main Street"
              value={checkoutData.address.line1}
              onChange={(e) => updateAddress("line1", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="line2">
              Apartment, suite, etc. <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="line2"
              placeholder="Apt 4B"
              value={checkoutData.address.line2}
              onChange={(e) => updateAddress("line2", e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={checkoutData.address.city}
                onChange={(e) => updateAddress("city", e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="CA"
                value={checkoutData.address.state}
                onChange={(e) => updateAddress("state", e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="w-1/2">
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              placeholder="94102"
              value={checkoutData.address.zip}
              onChange={(e) => updateAddress("zip", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="saveAddress"
            checked={checkoutData.saveAddress}
            onCheckedChange={(checked) => setCheckoutData({ saveAddress: checked as boolean })}
          />
          <Label htmlFor="saveAddress" className="text-sm font-normal cursor-pointer">
            Save this address for future orders
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="h-12 bg-transparent">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onNext} size="lg" className="flex-1 h-12 text-base" disabled={!isAddressComplete}>
          Continue
        </Button>
      </div>
    </div>
  )
}
