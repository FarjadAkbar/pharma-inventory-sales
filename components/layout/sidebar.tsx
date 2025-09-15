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
  ShoppingCart,
  TestTube,
  Shield,
  Factory,
  Truck,
  ClipboardCheck,
  AlertTriangle,
  BarChart3,
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
    case "dashboard":
      return LayoutDashboard
    case "drugs":
      return Package
    case "raw-materials":
      return Package
    case "suppliers":
      return Building2
    case "purchase-orders":
      return ShoppingCart
    case "goods-receipts":
      return ClipboardCheck
    case "qc-tests":
      return TestTube
    case "samples":
      return TestTube
    case "qa-releases":
      return Shield
    case "boms":
      return Factory
    case "work-orders":
      return Factory
    case "batches":
      return Factory
    case "inventory":
      return Store
    case "shipments":
      return Truck
    case "sales-orders":
      return TrendingUp
    case "users":
      return UserPlus
    case "reports":
      return BarChart3
    case "settings":
      return Settings
    default:
      return LayoutDashboard
  }
}

const getScreenTitle = (screenName: string) => {
  switch (screenName) {
    case "dashboard":
      return "Dashboard"
    case "drugs":
      return "Drugs"
    case "raw-materials":
      return "Raw Materials"
    case "suppliers":
      return "Suppliers"
    case "purchase-orders":
      return "Purchase Orders"
    case "goods-receipts":
      return "Goods Receipts"
    case "qc-tests":
      return "QC Tests"
    case "samples":
      return "Samples"
    case "qa-releases":
      return "QA Releases"
    case "boms":
      return "BOMs"
    case "work-orders":
      return "Work Orders"
    case "batches":
      return "Batches"
    case "inventory":
      return "Inventory"
    case "shipments":
      return "Shipments"
    case "sales-orders":
      return "Sales Orders"
    case "users":
      return "Users"
    case "reports":
      return "Reports"
    case "settings":
      return "Settings"
    default:
      return screenName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

const getScreenHref = (screenName: string) => {
  switch (screenName) {
    case "dashboard":
      return "/dashboard"
    case "drugs":
      return "/dashboard/drugs"
    case "raw-materials":
      return "/dashboard/raw-materials"
    case "suppliers":
      return "/dashboard/suppliers"
    case "purchase-orders":
      return "/dashboard/procurement/purchase-orders"
    case "goods-receipts":
      return "/dashboard/procurement/goods-receipts"
    case "qc-tests":
      return "/dashboard/quality/qc-tests"
    case "samples":
      return "/dashboard/quality/samples"
    case "qa-releases":
      return "/dashboard/quality/qa-releases"
    case "boms":
      return "/dashboard/manufacturing/boms"
    case "work-orders":
      return "/dashboard/manufacturing/work-orders"
    case "batches":
      return "/dashboard/manufacturing/batches"
    case "inventory":
      return "/dashboard/warehouse/inventory"
    case "shipments":
      return "/dashboard/distribution/shipments"
    case "sales-orders":
      return "/dashboard/sales/orders"
    case "users":
      return "/dashboard/users"
    case "reports":
      return "/dashboard/reports"
    case "settings":
      return "/dashboard/settings"
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

    // Define pharmaceutical modules based on user role
    const pharmaceuticalModules = [
      // Master Data Management
      { title: "Drugs", icon: Package, href: "/dashboard/drugs", screen: "drugs" },
      { title: "Raw Materials", icon: Package, href: "/dashboard/raw-materials", screen: "raw-materials" },
      { title: "Suppliers", icon: Building2, href: "/dashboard/suppliers", screen: "suppliers" },
      
      // Procurement Module
      { title: "Purchase Orders", icon: ShoppingCart, href: "/dashboard/procurement/purchase-orders", screen: "purchase-orders" },
      { title: "Goods Receipts", icon: ClipboardCheck, href: "/dashboard/procurement/goods-receipts", screen: "goods-receipts" },
      
      // Quality Control Module
      { title: "QC Tests", icon: TestTube, href: "/dashboard/quality/qc-tests", screen: "qc-tests" },
      { title: "Samples", icon: TestTube, href: "/dashboard/quality/samples", screen: "samples" },
      
      // Quality Assurance Module
      { title: "QA Releases", icon: Shield, href: "/dashboard/quality/qa-releases", screen: "qa-releases" },
      
      // Manufacturing Module
      { title: "BOMs", icon: Factory, href: "/dashboard/manufacturing/boms", screen: "boms" },
      { title: "Work Orders", icon: Factory, href: "/dashboard/manufacturing/work-orders", screen: "work-orders" },
      { title: "Batches", icon: Factory, href: "/dashboard/manufacturing/batches", screen: "batches" },
      
      // Warehouse Operations
      { title: "Inventory", icon: Store, href: "/dashboard/warehouse/inventory", screen: "inventory" },
      
      // Distribution & Sales
      { title: "Sales Orders", icon: TrendingUp, href: "/dashboard/sales/orders", screen: "sales-orders" },
      { title: "Shipments", icon: Truck, href: "/dashboard/distribution/shipments", screen: "shipments" },
      { title: "Cold Chain", icon: AlertTriangle, href: "/dashboard/distribution/cold-chain", screen: "cold-chain" },
      { title: "Proof of Delivery", icon: ClipboardCheck, href: "/dashboard/distribution/pod", screen: "pod" },
      
      // Reports & Analytics
      { title: "Reports", icon: BarChart3, href: "/dashboard/reports", screen: "reports" },
    ]

    // Add modules based on user role and permissions
    pharmaceuticalModules.forEach(module => {
      // For now, show all modules - in real app, check permissions
      modules.push({
        title: module.title,
        icon: module.icon,
        screens: [{ title: module.title, href: module.href, icon: module.icon }]
      })
    })

    // Add User Management module
    modules.push({
      title: "User Management",
      icon: Users,
      screens: [{ title: "Users", href: "/dashboard/users", icon: UserPlus }]
    })

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
