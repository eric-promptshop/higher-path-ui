"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { demoUsers, useAuthStore, getRoleRedirectPath } from "@/lib/auth-store"

type LoginState = "idle" | "loading" | "success" | "error" | "locked"

interface StaffLoginFormProps {
  collapsible?: boolean
  defaultOpen?: boolean
}

export function StaffLoginForm({ collapsible = false, defaultOpen = false }: StaffLoginFormProps) {
  const router = useRouter()
  const { setUser, rememberMe, setRememberMe } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loginState, setLoginState] = useState<LoginState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [userName, setUserName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!email.trim()) {
      setErrorMessage("Please enter your email address")
      setLoginState("error")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address")
      setLoginState("error")
      return
    }

    if (!password) {
      setErrorMessage("Please enter your password")
      setLoginState("error")
      return
    }

    setLoginState("loading")
    setErrorMessage("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const normalizedEmail = email.toLowerCase().trim()
    const userRecord = demoUsers[normalizedEmail]

    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user)
      setUserName(userRecord.user.name)
      setLoginState("success")
      setFailedAttempts(0)

      setTimeout(() => {
        router.push(getRoleRedirectPath(userRecord.user.role))
      }, 1500)
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)

      if (newAttempts >= 5) {
        setLoginState("locked")
        setErrorMessage("Too many failed login attempts. Your account has been locked for security.")
      } else {
        setLoginState("error")
        setErrorMessage("Incorrect email or password. Please check your credentials and try again.")
      }
    }
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    if (field === "email") setEmail(value)
    else setPassword(value)

    if (loginState === "error") {
      setLoginState("idle")
      setErrorMessage("")
    }
  }

  // Locked state
  if (loginState === "locked") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Account Locked</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Too many failed login attempts. Your account has been locked for security. Please wait 30 minutes or contact
            your administrator.
          </p>
          <Button variant="outline" className="w-full bg-transparent">
            Contact Administrator
          </Button>
        </div>
      </div>
    )
  }

  // Success state
  if (loginState === "success") {
    return (
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm text-center animate-in fade-in-0 zoom-in-95 duration-300">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Welcome back, {userName}!</h2>
        <p className="text-sm text-muted-foreground mb-4">Redirecting to dashboard...</p>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[progress_1.5s_ease-in-out]" style={{ width: "100%" }} />
        </div>
      </div>
    )
  }

  const formContent = (
    <>
      {errorMessage && loginState === "error" && (
        <div className="bg-destructive/5 border border-destructive/20 text-destructive rounded-lg p-3 mb-4 flex items-start gap-2 text-sm animate-in fade-in-0 slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="you@example.com"
            className="h-11"
            disabled={loginState === "loading"}
            autoComplete="email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter your password"
              className="h-11 pr-10"
              disabled={loginState === "loading"}
              autoComplete="current-password"
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Keep me signed in
            </label>
          </div>
        </div>

        <Button type="submit" className="w-full h-11 font-medium" disabled={loginState === "loading"}>
          {loginState === "loading" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push("/login/forgot-password")}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Forgot password?
        </button>
      </div>
    </>
  )

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <div>
                <h2 className="font-semibold text-foreground">Staff Login</h2>
                <p className="text-sm text-muted-foreground">Team members sign in here</p>
              </div>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-6 pt-2 border-t border-border">{formContent}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-1">Staff Login</h2>
        <p className="text-sm text-muted-foreground">Team members sign in here</p>
      </div>
      {formContent}
    </div>
  )
}
