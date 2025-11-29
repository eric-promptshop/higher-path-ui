"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ExternalLink, Loader2, Copy, Check } from "lucide-react"
import type { PaymentMethod } from "@/lib/store"

interface PaymentInstructionsProps {
  paymentMethod: PaymentMethod
  amount: string
  orderId: string
  onPaymentConfirmed: () => void
  onBack: () => void
}

const paymentConfig: Record<
  Exclude<PaymentMethod, "cash">,
  {
    name: string
    handle: string
    color: string
    bgColor: string
    deepLink: (amount: string, note: string) => string
    appStoreLink: string
  }
> = {
  venmo: {
    name: "Venmo",
    handle: "@HigherPath",
    color: "#3D95CE",
    bgColor: "bg-[#3D95CE]/10",
    deepLink: (amount, note) =>
      `venmo://paycharge?txn=pay&recipients=HigherPath&amount=${amount}&note=${encodeURIComponent(note)}`,
    appStoreLink: "https://venmo.com/",
  },
  cashapp: {
    name: "Cash App",
    handle: "$HigherPath",
    color: "#00D632",
    bgColor: "bg-[#00D632]/10",
    deepLink: (amount, note) =>
      `cashapp://cash.app/pay/$HigherPath?amount=${amount}&note=${encodeURIComponent(note)}`,
    appStoreLink: "https://cash.app/",
  },
  zelle: {
    name: "Zelle",
    handle: "pay@higherpath.com",
    color: "#6D1ED4",
    bgColor: "bg-[#6D1ED4]/10",
    // Zelle doesn't support deep links, so we just show instructions
    deepLink: () => "",
    appStoreLink: "https://www.zellepay.com/",
  },
}

export function PaymentInstructions({
  paymentMethod,
  amount,
  orderId,
  onPaymentConfirmed,
  onBack,
}: PaymentInstructionsProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

  if (paymentMethod === "cash") {
    // Cash on delivery - just confirm the order
    onPaymentConfirmed()
    return null
  }

  const config = paymentConfig[paymentMethod]
  const paymentNote = `Order #${orderId}`

  const handleOpenApp = () => {
    const deepLink = config.deepLink(amount, paymentNote)
    if (deepLink) {
      window.location.href = deepLink
    } else {
      // For Zelle, open the website
      window.open(config.appStoreLink, "_blank")
    }
  }

  const handleCopyHandle = async () => {
    await navigator.clipboard.writeText(config.handle)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async () => {
    setIsConfirming(true)
    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000))
    onPaymentConfirmed()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Payment App Icon */}
        <div
          className={`w-20 h-20 rounded-2xl ${config.bgColor} flex items-center justify-center mb-6`}
          style={{ color: config.color }}
        >
          <span className="text-3xl font-bold">{config.name.charAt(0)}</span>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Complete Payment via {config.name}
        </h1>

        <p className="text-muted-foreground mb-6">
          Order #{orderId}
        </p>

        {/* Amount */}
        <div className="w-full max-w-sm bg-card rounded-xl border border-border p-6 mb-6">
          <p className="text-sm text-muted-foreground mb-1">Amount to Pay</p>
          <p className="text-4xl font-bold text-foreground">${amount}</p>
        </div>

        {/* Payment Instructions */}
        <div className="w-full max-w-sm bg-secondary/50 rounded-xl p-4 mb-6 text-left space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Send payment to:</p>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 bg-background rounded px-3 py-2 text-foreground font-mono"
                style={{ color: config.color }}
              >
                {config.handle}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={handleCopyHandle}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1">Include this note:</p>
            <code className="block bg-background rounded px-3 py-2 text-muted-foreground font-mono text-sm">
              {paymentNote}
            </code>
          </div>

          {paymentMethod === "zelle" && (
            <p className="text-xs text-muted-foreground">
              Open your banking app and send via Zelle to the email above.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={handleOpenApp}
            size="lg"
            className="w-full h-12 gap-2"
            style={{ backgroundColor: config.color }}
          >
            <ExternalLink className="h-4 w-4" />
            Open {config.name}
          </Button>

          <Button
            onClick={handleConfirmPayment}
            variant="outline"
            size="lg"
            className="w-full h-12 gap-2 bg-transparent"
            disabled={isConfirming}
          >
            {isConfirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                I&apos;ve Completed Payment
              </>
            )}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            disabled={isConfirming}
          >
            Go Back
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground mt-6 max-w-sm">
          Your order will be marked as &quot;pending payment verification&quot; until we confirm receipt.
          We&apos;ll notify you once your payment is verified.
        </p>
      </main>
    </div>
  )
}
