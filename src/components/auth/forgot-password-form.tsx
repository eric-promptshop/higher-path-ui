"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Mail, CheckCircle2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type FlowState = "request" | "sent" | "reset" | "success"

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 12 characters", test: (p) => p.length >= 12 },
  { label: "1 uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "1 lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "1 number", test: (p) => /\d/.test(p) },
  { label: "1 special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export function ForgotPasswordForm() {
  const router = useRouter()
  const [flowState, setFlowState] = useState<FlowState>("request")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setFlowState("sent")
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    const failedRequirements = passwordRequirements.filter((req) => !req.test(password))
    if (failedRequirements.length > 0) {
      setError("Please meet all password requirements")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)
    setError("")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    setFlowState("success")
  }

  const getPasswordStrength = (): { score: number; label: string; color: string } => {
    const passedCount = passwordRequirements.filter((req) => req.test(password)).length
    const score = (passedCount / passwordRequirements.length) * 100

    if (score <= 20) return { score, label: "Very Weak", color: "bg-destructive" }
    if (score <= 40) return { score, label: "Weak", color: "bg-destructive" }
    if (score <= 60) return { score, label: "Fair", color: "bg-warning" }
    if (score <= 80) return { score, label: "Good", color: "bg-info" }
    return { score, label: "Strong", color: "bg-primary" }
  }

  const strength = getPasswordStrength()

  // Request reset email form
  if (flowState === "request") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Reset Your Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/5 border border-destructive/20 text-destructive rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="you@example.com"
              className="h-11"
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>

          <Button type="submit" className="w-full h-11 font-medium" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </div>
    )
  }

  // Email sent confirmation
  if (flowState === "sent") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Mail className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Check Your Email</h2>
        <p className="text-sm text-muted-foreground mb-2">We&apos;ve sent a password reset link to:</p>
        <p className="font-medium text-foreground mb-4">{email}</p>
        <p className="text-xs text-muted-foreground mb-6">The link will expire in 1 hour.</p>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true)
                setTimeout(() => {
                  setIsLoading(false)
                }, 1500)
              }}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Resend link"}
            </Button>
            <Button variant="ghost" size="sm">
              Contact support
            </Button>
          </div>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </button>

        {/* Demo button to simulate clicking the email link */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Demo: Simulate email link click</p>
          <Button variant="secondary" size="sm" onClick={() => setFlowState("reset")}>
            Open Reset Form
          </Button>
        </div>
      </div>
    )
  }

  // New password form
  if (flowState === "reset") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Create New Password</h2>
          <p className="text-sm text-muted-foreground">Enter a new password for your account</p>
        </div>

        {error && (
          <div className="bg-destructive/5 border border-destructive/20 text-destructive rounded-lg p-3 mb-4 flex items-start gap-2 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                placeholder="Enter new password"
                className="h-11 pr-10"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {password && (
            <div className="space-y-2 animate-in fade-in-0 slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <Progress value={strength.score} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-16">{strength.label}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {passwordRequirements.map((req, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-xs flex items-center gap-1",
                      req.test(password) ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    <CheckCircle2 className={cn("h-3 w-3", !req.test(password) && "opacity-30")} />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError("")
                }}
                placeholder="Confirm new password"
                className={cn("h-11 pr-10", confirmPassword && password !== confirmPassword && "border-destructive")}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-medium"
            disabled={isLoading || strength.score < 100 || password !== confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    )
  }

  // Success state
  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm max-w-md mx-auto text-center">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground mb-2">Password Reset Successfully</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Your password has been updated. You can now sign in with your new password.
      </p>
      <Button onClick={() => router.push("/login")} className="w-full h-11 font-medium">
        Sign In
      </Button>
    </div>
  )
}
