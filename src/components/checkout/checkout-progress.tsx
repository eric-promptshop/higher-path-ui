"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CheckoutProgressProps {
  currentStep: number
  steps: string[]
}

export function CheckoutProgress({ currentStep, steps }: CheckoutProgressProps) {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    isComplete && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isComplete && !isCurrent && "bg-secondary text-muted-foreground",
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1.5 hidden sm:block",
                    isCurrent ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 sm:w-16 h-0.5 mx-2 transition-colors duration-200",
                    stepNumber < currentStep ? "bg-primary" : "bg-secondary",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
