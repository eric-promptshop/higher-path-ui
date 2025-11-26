"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, AlertCircle, MessageCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { validAccessCodes, currentPassword } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

type AccessState = "idle" | "loading" | "success" | "error"

interface CustomerAccessFormProps {
  onMagicLinkDetected?: () => void
}

export function CustomerAccessForm({ onMagicLinkDetected }: CustomerAccessFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [accessCode, setAccessCode] = useState("")
  const [accessState, setAccessState] = useState<AccessState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isMagicLink, setIsMagicLink] = useState(false)

  // Check for magic link token on mount
  useEffect(() => {
    const token = searchParams.get("token")
    if (token) {
      setIsMagicLink(true)
      onMagicLinkDetected?.()
      validateMagicLink(token)
    } else {
      // Auto-focus input for customer priority
      inputRef.current?.focus()
    }
  }, [searchParams, onMagicLinkDetected])

  const validateMagicLink = async (token: string) => {
    setAccessState("loading")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (token === "expired") {
      setAccessState("error")
      setErrorMessage("This access link has expired. Please request a new one.")
      setIsMagicLink(false)
    } else if (token === "invalid") {
      setAccessState("error")
      setErrorMessage("This link is invalid or has already been used.")
      setIsMagicLink(false)
    } else {
      setAccessState("success")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessCode.trim()) {
      setErrorMessage("Please enter an access code")
      setAccessState("error")
      return
    }

    setAccessState("loading")
    setErrorMessage("")

    // Simulate API validation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const normalizedCode = accessCode.trim().toUpperCase()
    const isValid =
      validAccessCodes.some((code) => code.toUpperCase() === normalizedCode) || normalizedCode === currentPassword.code

    if (isValid) {
      setAccessState("success")
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } else {
      setAccessState("error")
      setErrorMessage("Invalid or expired access code. Please check and try again.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setAccessCode(value)
    if (accessState === "error") {
      setAccessState("idle")
      setErrorMessage("")
    }
  }

  // Magic link loading state
  if (isMagicLink && accessState === "loading") {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Verifying your access...</h2>
        <p className="text-sm text-muted-foreground">Please wait a moment</p>
      </div>
    )
  }

  // Success state
  if (accessState === "success") {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Access verified!</h2>
        <p className="text-sm text-muted-foreground mb-4">Redirecting to your menu...</p>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[progress_1.5s_ease-in-out]" style={{ width: "100%" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Customer Access</h2>
        <p className="text-sm text-muted-foreground">Enter your access code or use the link sent to you via Signal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="access-code" className={cn(accessState === "error" && "text-destructive")}>
            Access Code
          </Label>
          <Input
            ref={inputRef}
            id="access-code"
            type="text"
            value={accessCode}
            onChange={handleInputChange}
            placeholder="Enter your access code"
            className={cn(
              "h-12 text-base uppercase tracking-wider",
              accessState === "error" && "border-destructive focus-visible:ring-destructive",
            )}
            disabled={accessState === "loading"}
            autoComplete="off"
            autoCapitalize="characters"
          />
          {accessState === "error" && errorMessage && (
            <p className="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in-0 slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errorMessage}
            </p>
          )}
          {accessState === "idle" && (
            <p className="text-xs text-muted-foreground">Example: ABC-123-XYZ or current monthly password</p>
          )}
        </div>

        <Button type="submit" className="w-full h-12 text-base font-medium gap-2" disabled={accessState === "loading"}>
          {accessState === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Access Menu
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have a code?{" "}
          <button className="text-primary hover:underline font-medium inline-flex items-center gap-1">
            Contact us for access
            <MessageCircle className="h-3.5 w-3.5" />
          </button>
        </p>
      </div>
    </div>
  )
}
