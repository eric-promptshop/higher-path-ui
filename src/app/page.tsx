"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Leaf,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowRight,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore, demoUsers, demoCustomerEmail, demoCustomer, getRoleRedirectPath } from "@/lib/auth-store"
import { requestMagicLink, adminLogin } from "@/lib/api"

type AuthMethod = "email" | "phone"
type AuthStep = "input" | "sending" | "sent" | "demo-redirect"

export default function LandingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { setUser, rememberMe, setRememberMe } = useAuthStore()

  // Customer auth state
  const [authMethod, setAuthMethod] = useState<AuthMethod>("email")
  const [authStep, setAuthStep] = useState<AuthStep>("input")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")

  // Admin auth state
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [adminError, setAdminError] = useState("")

  // Format phone number as user types
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setCustomerPhone(formatted)
  }

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = authMethod === "email" ? customerEmail : customerPhone

    if (!value.trim()) {
      toast({
        title: "Required",
        description: `Please enter your ${authMethod === "email" ? "email address" : "phone number"}.`,
        variant: "destructive",
      })
      return
    }

    setAuthStep("sending")

    try {
      // Call real API to send magic link
      const method = authMethod === "phone" ? "sms" : "email"
      const result = await requestMagicLink(value, method)

      if (result.success) {
        setAuthStep("sent")
        toast({
          title: "Magic link sent!",
          description:
            authMethod === "email" ? `Check your inbox at ${customerEmail}` : `Check your messages at ${customerPhone}`,
        })
      } else {
        throw new Error(result.message || "Failed to send magic link")
      }
    } catch (error) {
      setAuthStep("input")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send magic link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError("")

    if (!adminEmail.trim() || !adminPassword.trim()) {
      setAdminError("Please enter both email and password.")
      return
    }

    setIsAdminLoading(true)

    try {
      // Call real API for admin login
      const result = await adminLogin(adminEmail, adminPassword)

      setUser({
        id: result.user.id,
        email: result.user.email,
        name: result.user.email.split("@")[0],
        role: result.user.role as "admin" | "manager" | "fulfillment",
      })

      toast({
        title: `Welcome back!`,
        description: "Redirecting to dashboard...",
      })

      router.push("/admin")
    } catch (error) {
      setAdminError(error instanceof Error ? error.message : "Invalid email or password.")
    } finally {
      setIsAdminLoading(false)
    }
  }

  const resetCustomerForm = () => {
    setAuthStep("input")
    setCustomerEmail("")
    setCustomerPhone("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/30 flex flex-col">
      {/* Header with Admin Sign In */}
      <header className="w-full px-4 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">Higher Path</span>
        </div>

        <Collapsible open={showAdminLogin} onOpenChange={setShowAdminLogin}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
              {showAdminLogin ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </header>

      {/* Admin Login Dropdown */}
      <Collapsible open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <CollapsibleContent className="px-4">
          <div className="max-w-sm mx-auto mb-6">
            <Card className="border-primary/20 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  Administrator Access
                </CardTitle>
                <CardDescription className="text-sm">For Ryan, Oriana, or authorized staff only</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-sm">
                      Email
                    </Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="ryan@demo.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-sm">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {adminError && <p className="text-sm text-destructive">{adminError}</p>}

                  <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    <p className="font-medium mb-1">Demo credentials:</p>
                    <p>ryan@demo.com / demo123</p>
                    <p>oriana@demo.com / demo123</p>
                  </div>

                  <Button type="submit" className="w-full" disabled={isAdminLoading}>
                    {isAdminLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Main Content - Customer Access */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-8">
          {/* Hero Text */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight text-balance">
              Welcome to Higher Path
            </h1>
            <p className="text-muted-foreground text-lg">Premium flower delivery, just for you</p>
          </div>

          {/* Customer Auth Card */}
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Access Your Menu</CardTitle>
              <CardDescription>Enter your contact info to receive a secure access link</CardDescription>
            </CardHeader>
            <CardContent>
              {authStep === "demo-redirect" ? (
                // Demo Redirect State
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Magic link activated!</h3>
                    <p className="text-sm text-muted-foreground">Redirecting to customer portal...</p>
                  </div>
                  <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                </div>
              ) : authStep === "sent" ? (
                // Success State
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    {authMethod === "email" ? (
                      <Mail className="w-8 h-8 text-primary" />
                    ) : (
                      <Phone className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      Check your {authMethod === "email" ? "inbox" : "messages"}!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We sent a magic link to{" "}
                      <span className="font-medium text-foreground">
                        {authMethod === "email" ? customerEmail : customerPhone}
                      </span>
                    </p>
                  </div>
                  <div className="pt-4 space-y-2">
                    <p className="text-xs text-muted-foreground">Didn't receive it? Check your spam folder or</p>
                    <Button variant="outline" size="sm" onClick={resetCustomerForm}>
                      Try again
                    </Button>
                  </div>
                </div>
              ) : (
                // Input Form
                <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as AuthMethod)}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="email" className="gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </TabsTrigger>
                    <TabsTrigger value="phone" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleCustomerSubmit}>
                    <TabsContent value="email" className="mt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-email">Email address</Label>
                          <Input
                            id="customer-email"
                            type="email"
                            placeholder="you@example.com"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="h-12 text-base"
                            disabled={authStep === "sending"}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Try <span className="font-medium">customer@demo.com</span> for demo access
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="phone" className="mt-0">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-phone">Phone number</Label>
                          <Input
                            id="customer-phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            value={customerPhone}
                            onChange={handlePhoneChange}
                            className="h-12 text-base"
                            disabled={authStep === "sending"}
                            maxLength={14}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <Button
                      type="submit"
                      className="w-full h-12 mt-6 text-base gap-2"
                      disabled={authStep === "sending"}
                    >
                      {authStep === "sending" ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending link...
                        </>
                      ) : (
                        <>
                          Send Magic Link
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </Tabs>
              )}
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Secure
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Private
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
              Discreet
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </footer>
    </div>
  )
}
