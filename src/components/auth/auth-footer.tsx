"use client"

import { Lock, Shield, FileText, HelpCircle } from "lucide-react"

export function AuthFooter() {
  return (
    <footer className="text-center space-y-4">
      {/* Security indicator */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span className="text-xs">Your connection is secure</span>
      </div>

      {/* Links */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Privacy Policy
        </button>
        <span className="text-border">•</span>
        <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Terms
        </button>
        <span className="text-border">•</span>
        <button className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          <HelpCircle className="h-3 w-3" />
          Help
        </button>
      </div>

      {/* Copyright */}
      <p className="text-xs text-muted-foreground">
        © 2025 Higher Path Flower
        <br />
        All data encrypted and secure
      </p>
    </footer>
  )
}
