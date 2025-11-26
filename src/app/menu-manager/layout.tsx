import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Menu Manager | Higher Path Flower",
  description: "Manage your product catalog",
}

export default function MenuManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
