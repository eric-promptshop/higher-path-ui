"use client"

import { Suspense } from "react"
import { AuthLogo } from "@/components/auth/auth-logo"
import { CustomerAccessForm } from "@/components/auth/customer-access-form"
import { StaffLoginForm } from "@/components/auth/staff-login-form"
import { AuthFooter } from "@/components/auth/auth-footer"
import { Loader2 } from "lucide-react"

function LoginContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-10">
          <AuthLogo />
        </div>

        {/* Desktop: Side by side layout */}
        <div className="w-full max-w-4xl hidden md:grid md:grid-cols-2 gap-6">
          <Suspense fallback={<FormSkeleton />}>
            <CustomerAccessForm />
          </Suspense>
          <StaffLoginForm />
        </div>

        {/* Mobile: Stacked layout with collapsible staff login */}
        <div className="w-full max-w-md md:hidden space-y-6">
          <Suspense fallback={<FormSkeleton />}>
            <CustomerAccessForm />
          </Suspense>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <StaffLoginForm collapsible />
        </div>
      </main>

      {/* Footer */}
      <div className="py-8 px-4">
        <AuthFooter />
      </div>
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-8 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function LoginPage() {
  return <LoginContent />
}
