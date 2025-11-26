"use client"

import { Leaf } from "lucide-react"

export function AuthLogo() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
        <Leaf className="h-8 w-8 text-primary-foreground" />
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">Higher Path Flower</h1>
        <p className="text-sm text-muted-foreground">Secure Order Portal</p>
      </div>
    </div>
  )
}
