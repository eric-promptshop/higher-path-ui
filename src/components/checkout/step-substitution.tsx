"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCartStore, type SubstitutionPreference } from "@/lib/store"
import { ArrowLeft, RefreshCw, MessageCircle, XCircle } from "lucide-react"

interface StepSubstitutionProps {
  onNext: () => void
  onBack: () => void
}

const options: { value: SubstitutionPreference; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "allow",
    label: "Allow substitutions",
    description: "We'll choose a similar product of equal or greater value",
    icon: <RefreshCw className="h-5 w-5" />,
  },
  {
    value: "contact",
    label: "Contact me first",
    description: "We'll reach out before making any substitutions",
    icon: <MessageCircle className="h-5 w-5" />,
  },
  {
    value: "cancel",
    label: "Cancel unavailable items",
    description: "Remove from order and adjust the total",
    icon: <XCircle className="h-5 w-5" />,
  },
]

export function StepSubstitution({ onNext, onBack }: StepSubstitutionProps) {
  const { checkoutData, setCheckoutData } = useCartStore()

  return (
    <div className="space-y-6 p-4 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Substitution Preferences</h2>
        <p className="text-muted-foreground">If an item becomes unavailable before delivery:</p>
      </div>

      <RadioGroup
        value={checkoutData.substitutionPreference}
        onValueChange={(value) => setCheckoutData({ substitutionPreference: value as SubstitutionPreference })}
        className="space-y-3"
      >
        {options.map((option) => (
          <Label
            key={option.value}
            htmlFor={option.value}
            className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
          >
            <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-primary">{option.icon}</span>
                <span className="font-medium text-foreground">{option.label}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            </div>
          </Label>
        ))}
      </RadioGroup>

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
