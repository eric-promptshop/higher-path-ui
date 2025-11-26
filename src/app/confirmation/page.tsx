"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2, Download, Truck, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") || "XXXXXX"

  const now = new Date()
  const orderDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const orderTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })

  // Estimate delivery (2 days from now for standard)
  const deliveryDate = new Date(now)
  deliveryDate.setDate(deliveryDate.getDate() + 2)
  const estimatedDelivery = deliveryDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Success Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in-50 duration-500">
            <CheckCircle2 className="h-12 w-12 text-primary animate-in zoom-in-75 duration-300 delay-200" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-300">
          Order Confirmed!
        </h1>

        <p className="text-muted-foreground mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-400">
          Order #{orderId}
          <br />
          Placed on {orderDate} at {orderTime}
        </p>

        {/* Estimated Delivery */}
        <div className="w-full max-w-sm bg-card rounded-xl border border-border p-4 mb-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-500">
          <div className="flex items-center gap-3 justify-center">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Delivery</p>
              <p className="font-medium text-foreground">{estimatedDelivery}</p>
              <p className="text-sm text-muted-foreground">Between 2:00 PM - 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="w-full max-w-sm space-y-3 text-left mb-8 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-700">
          <h2 className="font-medium text-foreground text-center mb-4">What happens next?</h2>
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">We&apos;ll review your order</p>
              <p className="text-xs text-muted-foreground">Usually within 30 minutes</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">You&apos;ll receive a confirmation</p>
              <p className="text-xs text-muted-foreground">Via Signal message</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">We&apos;ll notify you when ready</p>
              <p className="text-xs text-muted-foreground">Before dispatch</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
              4
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Delivery arrives</p>
              <p className="text-xs text-muted-foreground">Discreet packaging</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500 delay-1000">
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Download Receipt
          </Button>
          <Button asChild className="w-full">
            <Link href="/">Return to Menu</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">Questions about your order?</p>
        <Button variant="link" className="text-primary gap-1 h-auto p-0">
          <MessageCircle className="h-4 w-4" />
          Contact us via Signal
        </Button>
      </footer>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
