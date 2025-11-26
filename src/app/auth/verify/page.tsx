"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, AlertCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthLogo } from "@/components/auth/auth-logo"
import { AuthFooter } from "@/components/auth/auth-footer"
import { useAuthStore } from "@/lib/auth-store"
import { verifyMagicLink } from "@/lib/api"

type AuthState = "loading" | "success" | "expired" | "invalid" | "error"

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [authState, setAuthState] = useState<AuthState>("loading")
  const [errorMessage, setErrorMessage] = useState("")
  const { setUser, setCustomerToken } = useAuthStore()

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setAuthState("invalid")
        setErrorMessage("No token provided")
        return
      }

      try {
        const result = await verifyMagicLink(token)

        if (result.success && result.customer) {
          // Store customer session
          setUser({
            id: result.customer.id,
            email: result.customer.email,
            name: result.customer.name || result.customer.email.split("@")[0],
            role: "customer",
          })

          if (result.token) {
            setCustomerToken(result.token)
          }

          setAuthState("success")

          // Redirect to shop after successful auth
          setTimeout(() => {
            router.push("/shop")
          }, 1500)
        } else {
          setAuthState("invalid")
          setErrorMessage("Invalid or expired token")
        }
      } catch (error) {
        console.error("Token verification failed:", error)
        if (error instanceof Error && error.message.includes("expired")) {
          setAuthState("expired")
          setErrorMessage("This link has expired. Please request a new one.")
        } else {
          setAuthState("error")
          setErrorMessage(error instanceof Error ? error.message : "Failed to verify token")
        }
      }
    }

    validateToken()
  }, [token, router, setUser, setCustomerToken])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-10">
        <AuthLogo />
      </div>

      {authState === "loading" && (
        <div className="text-center animate-in fade-in-0 duration-300">
          <h1 className="text-xl font-semibold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground mb-6">Verifying your access link...</p>
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

      {(authState === "expired" || authState === "invalid" || authState === "error") && (
        <div className="text-center animate-in fade-in-0 duration-300 max-w-sm">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {authState === "expired" ? "Link Expired" : authState === "error" ? "Verification Failed" : "Invalid Link"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {errorMessage ||
              (authState === "expired"
                ? "This access link has expired. Please request a new one to continue."
                : "This link is invalid or has already been used. Please request a new link.")}
          </p>
          <div className="space-y-3">
            <Button onClick={() => router.push("/")} variant="default" className="w-full">
              Request New Link
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
      )}

      {/* Trust Footer */}
      <div className="mt-auto pt-12">
        <AuthFooter />
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  )
}
