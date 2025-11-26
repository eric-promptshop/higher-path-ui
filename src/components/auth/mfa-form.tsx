"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore, getRoleRedirectPath } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

type MFAState = "input" | "loading" | "error" | "success"

export function MFAForm() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [mfaState, setMfaState] = useState<MFAState>("input")
  const [error, setError] = useState("")
  const [resendCountdown, setResendCountdown] = useState(60)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError("")

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (index === 5 && value) {
      const fullCode = newCode.join("")
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split("")
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (fullCode: string) => {
    setMfaState("loading")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Demo: Accept "123456" as valid code
    if (fullCode === "123456") {
      setMfaState("success")
      setTimeout(() => {
        router.push(user ? getRoleRedirectPath(user.role) : "/admin")
      }, 1000)
    } else {
      setMfaState("error")
      setError("Invalid verification code. Please try again.")
      setCode(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = () => {
    setResendCountdown(60)
    // Simulate resend
  }

  if (mfaState === "success") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto text-center animate-in fade-in-0 zoom-in-95">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Verified!</h2>
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto">
      <button
        onClick={() => router.push("/login")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Verify Your Identity</h2>
        <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app or SMS</p>
      </div>

      {error && (
        <div className="bg-destructive/5 border border-destructive/20 text-destructive rounded-lg p-3 mb-4 flex items-start gap-2 text-sm animate-in fade-in-0 shake">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {code.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn("w-11 h-14 text-center text-xl font-semibold", mfaState === "error" && "border-destructive")}
            disabled={mfaState === "loading"}
            maxLength={1}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerify(code.join(""))}
        className="w-full h-11 font-medium"
        disabled={mfaState === "loading" || code.some((d) => !d)}
      >
        {mfaState === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Verifying...
          </>
        ) : (
          "Verify"
        )}
      </Button>

      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive a code?</p>
        <div className="flex justify-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleResend} disabled={resendCountdown > 0}>
            {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend code"}
          </Button>
          <Button variant="ghost" size="sm">
            Use backup method
          </Button>
        </div>
      </div>

      {/* Demo hint */}
      <div className="mt-6 pt-4 border-t border-border text-center">
        <p className="text-xs text-muted-foreground">Demo: Enter 123456 to verify</p>
      </div>
    </div>
  )
}
