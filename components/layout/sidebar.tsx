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
  User,
  Key,
  Eye,
  Settings,
  ClipboardCheck,
  Thermometer,
  Barcode,
  FileCheck,
  GraduationCap,
  Download,
  Calendar,
  AlertTriangle,
  Workflow,
  Zap
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
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
  const { user } = useAuth()

  if (!user) return null

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
        { title: "Users", href: "/dashboard/users", icon: Users },
        { title: "Roles", href: "/dashboard/roles", icon: Key },
        { title: "Permissions", href: "/dashboard/permissions", icon: Shield },
        { title: "Refresh Tokens", href: "/dashboard/refresh-tokens", icon: Key },
        { title: "Audit Logs", href: "/dashboard/reports/audit", icon: Eye },
      ]
    },
    {
      title: "Master Data",
      icon: Package,
      items: [
        { title: "Drugs", href: "/dashboard/drugs", icon: Package },
        { title: "Raw Materials", href: "/dashboard/raw-materials", icon: Package },
        { title: "Suppliers", href: "/dashboard/suppliers", icon: Building2 },
        { title: "Distributors", href: "/dashboard/distributors", icon: Building2 },
        { title: "Sites", href: "/dashboard/sites", icon: Building2 },
        { title: "Storage Locations", href: "/dashboard/storage-locations", icon: Store },
        { title: "Equipment", href: "/dashboard/equipment", icon: Settings },
        { title: "Units of Measure", href: "/dashboard/units", icon: Package },
      ]
    },
    {
      title: "Procurement",
      icon: ShoppingCart,
      items: [
        { title: "Purchase Orders", href: "/dashboard/procurement/purchase-orders", icon: ShoppingCart },
        { title: "Goods Receipts", href: "/dashboard/procurement/goods-receipts", icon: ClipboardCheck },
        { title: "Certificate of Analysis", href: "/dashboard/procurement/coa", icon: FileCheck },
      ]
    },
    {
      title: "Manufacturing",
      icon: Factory,
      items: [
        { title: "Bill of Materials", href: "/dashboard/manufacturing/boms", icon: Factory },
        { title: "Work Orders", href: "/dashboard/manufacturing/work-orders", icon: Factory },
        { title: "Batches", href: "/dashboard/manufacturing/batches", icon: Factory },
        { title: "Batch Consumptions", href: "/dashboard/manufacturing/consumptions", icon: Package },
        { title: "Electronic Batch Records", href: "/dashboard/manufacturing/ebr", icon: FileText },
      ]
    },
    {
      title: "Quality (QC/QA)",
      icon: TestTube,
      items: [
        { title: "Quality Control Tests", href: "/dashboard/quality/qc-tests", icon: TestTube },
        { title: "Sample Requests", href: "/dashboard/quality/samples", icon: TestTube },
        { title: "Sample Results", href: "/dashboard/quality/sample-results", icon: TestTube },
        { title: "Quality Assurance Releases", href: "/dashboard/quality/qa-releases", icon: Shield },
        { title: "Deviations / CAPA", href: "/dashboard/quality/deviations", icon: AlertTriangle },
      ]
    },
    {
      title: "Warehouse",
      icon: Store,
      items: [
        { title: "Inventory Lots", href: "/dashboard/warehouse/inventory", icon: Store },
        { title: "Stock Movements", href: "/dashboard/warehouse/movements", icon: Store },
        { title: "Storage Locations", href: "/dashboard/warehouse/locations", icon: Store },
        { title: "Temperature Logs", href: "/dashboard/warehouse/temperature", icon: Thermometer },
        { title: "Cycle Counts", href: "/dashboard/warehouse/cycle-counts", icon: Store },
        { title: "Labels & Barcodes", href: "/dashboard/warehouse/labels", icon: Barcode },
      ]
    },
    {
      title: "Distribution",
      icon: Truck,
      items: [
        { title: "Sales Orders", href: "/dashboard/sales/orders", icon: TrendingUp },
        { title: "Shipments", href: "/dashboard/distribution/shipments", icon: Truck },
        { title: "Shipment Items", href: "/dashboard/distribution/shipment-items", icon: Package },
        { title: "Cold Chain Sensors", href: "/dashboard/distribution/cold-chain", icon: Thermometer },
        { title: "Proof of Delivery", href: "/dashboard/distribution/pod", icon: ClipboardCheck },
      ]
    },
    {
      title: "Sales / CRM",
      icon: TrendingUp,
      items: [
        { title: "Accounts", href: "/dashboard/sales/accounts", icon: Building2 },
        { title: "Activities", href: "/dashboard/sales/activities", icon: Calendar },
        { title: "Contracts", href: "/dashboard/sales/contracts", icon: FileText },
        { title: "Point of Sale", href: "/dashboard/sales/pos", icon: TrendingUp },
      ]
    },
    {
      title: "Regulatory & Documents",
      icon: FileText,
      items: [
        { title: "Documents", href: "/dashboard/regulatory/documents", icon: FileText },
        { title: "Document Approvals", href: "/dashboard/regulatory/approvals", icon: FileCheck },
        { title: "Training Records", href: "/dashboard/regulatory/training", icon: GraduationCap },
      ]
    },
    {
      title: "Integration & Workflows",
      icon: Workflow,
      items: [
        { title: "Integration Dashboard", href: "/dashboard/integration", icon: Zap },
        { title: "Workflow Manager", href: "/dashboard/integration/workflows", icon: Workflow },
        { title: "Compliance Metrics", href: "/dashboard/integration/metrics", icon: Shield },
        { title: "Analytics", href: "/dashboard/integration/analytics", icon: BarChart3 },
      ]
    },
    {
      title: "Reporting & Analytics",
      icon: BarChart3,
      items: [
        { title: "Dashboards", href: "/dashboard/reports/executive", icon: BarChart3 },
        { title: "Exports", href: "/dashboard/reports/exports", icon: Download },
        { title: "Scheduled Reports", href: "/dashboard/reports/scheduled", icon: Calendar },
        { title: "Recall Coverage", href: "/dashboard/reports/recall", icon: AlertTriangle },
      ]
    }
  ]

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
          {navigationGroups.map((group) => {
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
            Role: {user.role}
          </div>
        </div>
      )}
    </div>
  )
}