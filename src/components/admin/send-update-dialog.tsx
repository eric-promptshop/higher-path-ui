"use client"

import { useState } from "react"
import { Mail, MessageSquare, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { sendOrderUpdate } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface SendUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail?: string | null
  customerPhone?: string | null
  currentStatus: string
}

export function SendUpdateDialog({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
}: SendUpdateDialogProps) {
  const [isSending, setIsSending] = useState(false)
  const [sendingMethod, setSendingMethod] = useState<"email" | "sms" | null>(null)
  const { toast } = useToast()

  const handleSendUpdate = async (method: "email" | "sms") => {
    if (method === "email" && !customerEmail) {
      toast({
        title: "No Email Address",
        description: "This customer doesn't have an email address on file.",
        variant: "destructive",
      })
      return
    }

    if (method === "sms" && !customerPhone) {
      toast({
        title: "No Phone Number",
        description: "This customer doesn't have a phone number on file.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    setSendingMethod(method)

    try {
      const result = await sendOrderUpdate(orderId, method)

      if (result.success) {
        toast({
          title: "Update Sent",
          description: `Status update sent via ${method === "email" ? "email" : "SMS"} to ${customerName}.`,
        })
        onOpenChange(false)
      } else {
        toast({
          title: "Failed to Send",
          description: result.error || "Could not send the update. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending update:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
      setSendingMethod(null)
    }
  }

  const hasEmail = !!customerEmail
  const hasPhone = !!customerPhone

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Order Update</DialogTitle>
          <DialogDescription>
            Send a status update notification for order #{orderNumber} to {customerName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer contact info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="font-medium text-sm">{customerName}</p>
            {customerEmail && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {customerEmail}
              </p>
            )}
            {customerPhone && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                {customerPhone}
              </p>
            )}
            {!hasEmail && !hasPhone && (
              <p className="text-sm text-destructive">
                No contact information available for this customer.
              </p>
            )}
          </div>

          {/* Send options */}
          <div className="grid gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              disabled={!hasEmail || isSending}
              onClick={() => handleSendUpdate("email")}
            >
              {isSending && sendingMethod === "email" ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Mail className="w-5 h-5 mr-3" />
              )}
              <div className="text-left">
                <p className="font-medium">Send via Email</p>
                <p className="text-sm text-muted-foreground font-normal">
                  {hasEmail ? customerEmail : "No email address on file"}
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto py-4 px-4"
              disabled={!hasPhone || isSending}
              onClick={() => handleSendUpdate("sms")}
            >
              {isSending && sendingMethod === "sms" ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <MessageSquare className="w-5 h-5 mr-3" />
              )}
              <div className="text-left">
                <p className="font-medium">Send via SMS</p>
                <p className="text-sm text-muted-foreground font-normal">
                  {hasPhone ? customerPhone : "No phone number on file"}
                </p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
