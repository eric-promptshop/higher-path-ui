import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Higher Path Flower | Order Portal",
  description: "Your trusted source for premium flower delivery. Discreet, reliable, professional.",
  openGraph: {
    title: "Higher Path Flower | Order Portal",
    description: "Your trusted source for premium flower delivery. Discreet, reliable, professional.",
    siteName: "Higher Path",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Higher Path Flower | Order Portal",
    description: "Your trusted source for premium flower delivery. Discreet, reliable, professional.",
  },
}

export const viewport: Viewport = {
  themeColor: "#2D5F3F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
