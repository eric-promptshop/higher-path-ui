import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin | Higher Path Flower",
  description: "Order management and business operations dashboard",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64 pb-16 lg:pb-0">{children}</div>
      <AdminMobileNav />
    </div>
  )
}
