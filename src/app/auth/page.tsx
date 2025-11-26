"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthLogo } from "@/components/auth/auth-logo"
import { AuthFooter } from "@/components/auth/auth-footer"

type AuthState = "loading" | "success" | "expired" | "invalid"

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [authState, setAuthState] = useState<AuthState>("loading")

  useEffect(() => {
    const validateToken = async () => {
      // Simulate token validation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (!token) {
        setAuthState("invalid")
        return
      }

      // Simulate different token states (for demo purposes)
      if (token === "expired") {
        setAuthState("expired")
      } else if (token === "invalid") {
        setAuthState("invalid")
      } else {
        setAuthState("success")
        // Redirect to menu after successful auth
        setTimeout(() => {
          router.push("/")
        }, 1000)
      }
    }

    validateToken()
  }, [token, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10">
        <AuthLogo />
      </div>

      {authState === "loading" && (
        <div className="text-center animate-in fade-in-0 duration-300">
          <h1 className="text-xl font-semibold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-6">Accessing your personalized menu...</p>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </div>
      )}

      {authState === "success" && (
        <div className="text-center animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">You&apos;re in!</h1>
          <p className="text-muted-foreground">Redirecting to your menu...</p>
        </div>
      )}

      {(authState === "expired" || authState === "invalid") && (
        <div className="text-center animate-in fade-in-0 duration-300 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {authState === "expired" ? "Link Expired" : "Invalid Link"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {authState === "expired"
              ? "This access link has expired. Please request a new one to continue."
              : "This link is invalid or has already been used. Please contact us for a new link."}
          </p>
          <Button className="w-full gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-auto pt-12">
        <AuthFooter />
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  )
}
