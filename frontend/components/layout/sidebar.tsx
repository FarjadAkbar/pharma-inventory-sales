"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth.context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  LayoutDashboard,
  Package,
  Building2,
  Users,
  Shield,
  ShoppingCart,
  Factory,
  TestTube,
  Store,
  Truck,
  TrendingUp,
  FileText,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Key,
  Eye,
  ClipboardCheck,
  FileCheck,
  AlertTriangle,
  Workflow,
  Zap,
  Beaker,
  MapPin
} from "lucide-react"

/** `target`: RBAC resource (raw_materials) or MODULE key (PROCUREMENT). See `lib/rbac.ts`. */
interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  perm?: { target: string; action: string }
}

interface NavGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  items: NavItem[]
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<string[]>([])
  const pathname = usePathname()
  const { user, hasPermission } = useAuth()

  if (!user) return null

  const canSee = (item: NavItem) =>
    !item.perm || hasPermission(item.perm.target, item.perm.action)

  const toggleGroup = (groupTitle: string) => {
    setOpenGroups(prev => 
      prev.includes(groupTitle) 
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    )
  }

  const navigationGroups: NavGroup[] = [
    {
      title: "Identity & Authentication",
      icon: Shield,
      items: [
        { title: "Users", href: "/dashboard/users", icon: Users, perm: { target: "users", action: "read" } },
        { title: "Roles", href: "/dashboard/roles", icon: Key, perm: { target: "roles", action: "read" } },
        { title: "Permissions", href: "/dashboard/permissions", icon: Shield, perm: { target: "permissions", action: "read" } },
      ]
    },
    {
      title: "Master Data",
      icon: Package,
      items: [
        { title: "Drugs", href: "/dashboard/drugs", icon: Package, perm: { target: "drugs", action: "read" } },
        { title: "Raw Materials", href: "/dashboard/raw-materials", icon: Package, perm: { target: "raw_materials", action: "read" } },
        { title: "Suppliers", href: "/dashboard/suppliers", icon: Building2, perm: { target: "suppliers", action: "read" } },
        { title: "Distributors", href: "/dashboard/distributors", icon: Building2, perm: { target: "accounts", action: "read" } },
        { title: "Sites", href: "/dashboard/sites", icon: Building2, perm: { target: "sites", action: "read" } },
        { title: "Units of Measure", href: "/dashboard/units", icon: Package, perm: { target: "units", action: "read" } },
      ]
    },
    {
      title: "Procurement",
      icon: ShoppingCart,
      items: [
        { title: "Purchase Orders", href: "/dashboard/procurement/purchase-orders", icon: ShoppingCart, perm: { target: "PROCUREMENT", action: "read" } },
        { title: "Goods Receipts", href: "/dashboard/procurement/goods-receipts", icon: ClipboardCheck, perm: { target: "PROCUREMENT", action: "read" } },
        { title: "Certificate of Analysis", href: "/dashboard/procurement/coa", icon: FileCheck, perm: { target: "PROCUREMENT", action: "read" } },
      ]
    },
    {
      title: "Manufacturing",
      icon: Factory,
      items: [
        { title: "Bill of Materials", href: "/dashboard/manufacturing/boms", icon: Factory, perm: { target: "MANUFACTURING", action: "read" } },
        { title: "Work Orders", href: "/dashboard/manufacturing/work-orders", icon: Factory, perm: { target: "MANUFACTURING", action: "read" } },
        { title: "Batches", href: "/dashboard/manufacturing/batches", icon: Factory, perm: { target: "MANUFACTURING", action: "read" } },
        { title: "Batch Consumptions", href: "/dashboard/manufacturing/consumptions", icon: Package, perm: { target: "MANUFACTURING", action: "read" } },
        { title: "Electronic Batch Records", href: "/dashboard/manufacturing/ebr", icon: FileText, perm: { target: "MANUFACTURING", action: "read" } },
      ]
    },
    {
      title: "Quality (QC/QA)",
      icon: TestTube,
      items: [
        { title: "QC Test Methods", href: "/dashboard/quality/qc-tests", icon: TestTube, perm: { target: "QUALITY", action: "read" } },
        { title: "QC Sample Requests", href: "/dashboard/quality/samples", icon: Beaker, perm: { target: "QUALITY", action: "read" } },
        { title: "QC Test Results", href: "/dashboard/quality/qc-results", icon: FileCheck, perm: { target: "QUALITY", action: "read" } },
        { title: "QA Releases", href: "/dashboard/quality/qa-releases", icon: Shield, perm: { target: "QUALITY", action: "read" } },
        { title: "Deviations / CAPA", href: "/dashboard/quality/deviations", icon: AlertTriangle, perm: { target: "QUALITY", action: "read" } },
      ]
    },
    {
      title: "Warehouse",
      icon: Store,
      items: [
        { title: "Warehouses", href: "/dashboard/warehouse/warehouses", icon: Building2, perm: { target: "WAREHOUSE", action: "read" } },
        { title: "Storage Locations", href: "/dashboard/warehouse/locations", icon: MapPin, perm: { target: "WAREHOUSE", action: "read" } },
        { title: "Inventory Lots", href: "/dashboard/warehouse/inventory", icon: Store, perm: { target: "WAREHOUSE", action: "read" } },
        { title: "Putaway Tasks", href: "/dashboard/warehouse/putaway", icon: Package, perm: { target: "WAREHOUSE", action: "read" } },
        { title: "Material Issues", href: "/dashboard/warehouse/material-issues", icon: ShoppingCart, perm: { target: "WAREHOUSE", action: "read" } },
        { title: "Stock Movements", href: "/dashboard/warehouse/movements", icon: Store, perm: { target: "WAREHOUSE", action: "read" } },
      ]
    },
    {
      title: "Sales",
      icon: TrendingUp,
      items: [
        { title: "Sales Orders", href: "/dashboard/sales/orders", icon: ShoppingCart, perm: { target: "sales_orders", action: "read" } },
        { title: "Shipments", href: "/dashboard/sales/shipments", icon: Truck, perm: { target: "shipments", action: "read" } },
        { title: "Proof of Delivery", href: "/dashboard/sales/pod", icon: ClipboardCheck, perm: { target: "pod", action: "read" } },
        { title: "Audit Trail", href: "/dashboard/audit", icon: Eye, perm: { target: "reports", action: "read" } },
      ]
    },
  ]

  const visibleGroups = navigationGroups
    .map((g) => ({
      ...g,
      items: g.items.filter(canSee),
    }))
    .filter((g) => g.items.length > 0)

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
            <h2 className="text-lg font-semibold text-sidebar-foreground">Ziauddin Pharma</h2>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {/* Dashboard Link */}
          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10 mb-2",
                collapsed && "justify-center px-2",
                pathname === "/dashboard" && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Dashboard</span>}
            </Button>
          </Link>

          {/* Navigation Groups */}
          {visibleGroups.map((group) => {
            const GroupIcon = group.icon
            const isGroupOpen = openGroups.includes(group.title)

            return (
              <Collapsible
                key={group.title}
                open={isGroupOpen}
                onOpenChange={() => toggleGroup(group.title)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-10 text-left",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <GroupIcon className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{group.title}</span>
                        {isGroupOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </>
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                {!collapsed && (
                  <CollapsibleContent className="space-y-1 ml-4">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon
                      const isActive = pathname === item.href

                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3 h-8 text-sm",
                              isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                            )}
                          >
                            <ItemIcon className="h-3 w-3 flex-shrink-0" />
                            <span>{item.title}</span>
                          </Button>
                        </Link>
                      )
                    })}
                  </CollapsibleContent>
                )}
              </Collapsible>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User Role Badge */}
      {!collapsed && user && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wide">
            Role:{" "}
            {typeof user.role === "object" && user.role !== null
              ? user.role.name
              : user.role}
          </div>
        </div>
      )}
    </div>
  )
}