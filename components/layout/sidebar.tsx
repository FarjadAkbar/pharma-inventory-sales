"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth.context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Building2,
  FolderOpen,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: ("admin" | "store_manager" | "employee")[]
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "store_manager", "employee"] },
  { title: "Products", href: "/dashboard/products", icon: Package, roles: ["admin", "store_manager", "employee"] },
  { title: "POS", href: "/dashboard/pos", icon: ShoppingCart, roles: ["admin", "store_manager", "employee"] },
  { title: "Vendors", href: "/dashboard/vendors", icon: Building2, roles: ["admin", "store_manager"] },
  { title: "Categories", href: "/dashboard/categories", icon: FolderOpen, roles: ["admin", "store_manager"] },
  { title: "Sales", href: "/dashboard/sales", icon: TrendingUp, roles: ["admin", "store_manager"] },
  { title: "Users", href: "/dashboard/users", icon: Users, roles: ["admin", "store_manager"] },
  { title: "Stores", href: "/dashboard/stores", icon: Store, roles: ["admin"] },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null
  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo/Brand */}
      <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <LayoutDashboard className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">Pharma Inventory Sales</h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href} onClick={() => {
                window.dispatchEvent(new Event("api:request:start"))
                // Failsafe auto-stop in case page has no API calls
                setTimeout(() => window.dispatchEvent(new Event("api:request:stop")), 800)
              }}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    collapsed && "justify-center px-2",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Role Badge */}
      {!collapsed && user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wide">Role: {user.role}</div>
        </div>
      )}
    </div>
  )
}
