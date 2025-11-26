import { AuthLogo } from "@/components/auth/auth-logo"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { AuthFooter } from "@/components/auth/auth-footer"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-10">
          <AuthLogo />
        </div>
        <ForgotPasswordForm />
      </main>
      <div className="py-8 px-4">
        <AuthFooter />
      </div>
    </div>
  )
}
