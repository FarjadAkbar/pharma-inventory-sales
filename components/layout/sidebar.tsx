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
  Building2,
  FolderOpen,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Store,
  UserPlus,
  Ruler,
  Settings,
} from "lucide-react"
import type { Permissions } from "@/types/auth"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface ModuleItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  screens: NavItem[]
}

const getScreenIcon = (screenName: string) => {
  switch (screenName) {
    case "product":
      return Package
    case "category":
      return FolderOpen
    case "supplier":
      return Building2
    case "unit":
      return Ruler
    case "equipment":
      return Settings
    case "store":
      return Store
    case "sale":
      return TrendingUp
    case "users":
      return UserPlus
    default:
      return LayoutDashboard
  }
}

const getScreenTitle = (screenName: string) => {
  switch (screenName) {
    case "product":
      return "Products"
    case "category":
      return "Categories"
    case "supplier":
      return "Suppliers"
    case "unit":
      return "Units"
    case "equipment":
      return "Equipment"
    case "store":
      return "Stores"
    case "sale":
      return "Sales"
    case "users":
      return "Users"
    default:
      return screenName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

const getScreenHref = (screenName: string) => {
  switch (screenName) {
    case "product":
      return "/dashboard/products"
    case "category":
      return "/dashboard/categories"
    case "supplier":
      return "/dashboard/suppliers"
    case "unit":
      return "/dashboard/units"
    case "equipment":
      return "/dashboard/equipment"
    case "store":
      return "/dashboard/stores"
    case "sale":
      return "/dashboard/sales"
    case "users":
      return "/dashboard/users"
    default:
      return "/dashboard"
  }
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, permissions } = useAuth()

  if (!user || !permissions) return null

  const buildNavigation = (): ModuleItem[] => {
    const modules: ModuleItem[] = []

    // Add Dashboard as first item
    modules.push({
      title: "Dashboard",
      icon: LayoutDashboard,
      screens: [{ title: "Overview", href: "/dashboard", icon: LayoutDashboard }]
    })

    // Add Permissions Demo for testing
    modules.push({
      title: "Permissions Demo",
      icon: Users,
      screens: [{ title: "Demo", href: "/dashboard/permissions-demo", icon: Users }]
    })

    // Build unified inventory management list
    const seenScreens = new Set<string>()
    
    Object.entries(permissions).forEach(([moduleName, modulePermissions]) => {
      Object.entries(modulePermissions).forEach(([screenName, permissions]) => {
        if (permissions.canView) {
          // Extract the base screen name (remove pos_ or pharma_ prefix)
          const baseScreenName = screenName.replace(/^(pos_|pharma_)/, '')
          
          // Only add if we haven't seen this screen type before
          if (!seenScreens.has(baseScreenName)) {
            seenScreens.add(baseScreenName)
            
            const screen: NavItem = {
              title: getScreenTitle(baseScreenName),
              href: getScreenHref(baseScreenName),
              icon: getScreenIcon(baseScreenName)
            }
            
            // Add each screen as a separate module (flat list)
            if (baseScreenName !== "users") {
              modules.push({
                title: screen.title,
                icon: screen.icon,
                screens: [screen]
              })
            }
          }
        }
      })
    })

    // Add User Management module
    if (permissions.USER_MANAGEMENT?.users?.canView) {
      modules.push({
        title: "User Management",
        icon: Users,
        screens: [{ title: "Users", href: "/dashboard/users", icon: UserPlus }]
      })
    }

    return modules
  }

  const navigation = buildNavigation()

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
          {navigation.map((module) => {
            const ModuleIcon = module.icon
            const isActive = pathname === module.screens[0].href

            return (
              <div key={module.title} className="space-y-1">
                <Link href={module.screens[0].href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10",
                      collapsed && "justify-center px-2",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <ModuleIcon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{module.title}</span>}
                  </Button>
                </Link>
              </div>
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
