import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth.context"
import { ConditionalStoreProvider } from "@/components/providers/conditional-store-provider"
import { GlobalLoader } from "@/components/ui/global-loader"
import { RouteChangeListener } from "@/components/ui/route-change-listener"
import { Toaster } from "@/components/ui/toast"

export const metadata: Metadata = {
  title: "Pharma Inventory Sales System", // Updated title from CRM System
  description: "Professional Pharma Inventory Sales System with Role-Based Access", // Updated description
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <ConditionalStoreProvider>
            <GlobalLoader />
            <RouteChangeListener />
            {children}
            <Toaster />
          </ConditionalStoreProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
