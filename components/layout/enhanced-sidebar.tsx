"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEnhancedPermissions } from "@/hooks/use-enhanced-permissions"
import { PermissionNavItem } from "@/components/auth/enhanced-permission-guard"
import { PHARMA_MODULES, PHARMA_SCREENS } from "@/lib/enhanced-permissions"
import {
  ChevronDown,
  ChevronRight,
  Users,
  Key,
  Shield,
  Eye,
  Package,
  Building2,
  Store,
  Settings,
  ShoppingCart,
  Factory,
  FlaskConical,
  CheckCircle,
  Warehouse,
  Truck,
  TrendingUp,
  FileText,
  BarChart3,
  Home,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  module: string
  screen: string
  children?: NavItem[]
}

interface NavGroup {
  title: string
  icon: React.ComponentType<{ className?: string }>
  module: string
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    title: "Dashboard",
    icon: Home,
    module: PHARMA_MODULES.IDENTITY,
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: BarChart3,
        module: PHARMA_MODULES.IDENTITY,
        screen: PHARMA_SCREENS.USERS, // Using users as default for dashboard access
      },
    ],
  },
  {
    title: "Identity & Authentication",
    icon: Shield,
    module: PHARMA_MODULES.IDENTITY,
    items: [
      {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
        module: PHARMA_MODULES.IDENTITY,
        screen: PHARMA_SCREENS.USERS,
      },
      {
        title: "Roles",
        href: "/dashboard/roles",
        icon: Key,
        module: PHARMA_MODULES.IDENTITY,
        screen: PHARMA_SCREENS.ROLES,
      },
      {
        title: "Permissions",
        href: "/dashboard/permissions",
        icon: Shield,
        module: PHARMA_MODULES.IDENTITY,
        screen: PHARMA_SCREENS.PERMISSIONS,
      },
      {
        title: "Refresh Tokens",
        href: "/dashboard/refresh-tokens",
        icon: Key,
        module: PHARMA_MODULES.IDENTITY,
        screen: PHARMA_SCREENS.REFRESH_TOKENS,
      },
      {
        title: "Audit Logs",
        href: "/dashboard/reports/audit",
        icon: Eye,
        module: PHARMA_MODULES.REPORTING,
        screen: PHARMA_SCREENS.EXECUTIVE_DASHBOARDS,
      },
    ],
  },
  {
    title: "Master Data",
    icon: Package,
    module: PHARMA_MODULES.MASTER_DATA,
    items: [
      {
        title: "Drugs",
        href: "/dashboard/drugs",
        icon: Package,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.DRUGS,
      },
      {
        title: "Raw Materials",
        href: "/dashboard/raw-materials",
        icon: Package,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.RAW_MATERIALS,
      },
      {
        title: "Suppliers",
        href: "/dashboard/suppliers",
        icon: Building2,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.SUPPLIERS,
      },
      {
        title: "Distributors",
        href: "/dashboard/distributors",
        icon: Building2,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.DISTRIBUTORS,
      },
      {
        title: "Sites",
        href: "/dashboard/sites",
        icon: Building2,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.SITES,
      },
      {
        title: "Storage Locations",
        href: "/dashboard/storage-locations",
        icon: Store,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.STORAGE_LOCATIONS,
      },
      {
        title: "Equipment",
        href: "/dashboard/equipment",
        icon: Settings,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.EQUIPMENT,
      },
      {
        title: "Units of Measure",
        href: "/dashboard/units",
        icon: Package,
        module: PHARMA_MODULES.MASTER_DATA,
        screen: PHARMA_SCREENS.UNITS,
      },
    ],
  },
  {
    title: "Procurement",
    icon: ShoppingCart,
    module: PHARMA_MODULES.PROCUREMENT,
    items: [
      {
        title: "Purchase Orders",
        href: "/dashboard/procurement/purchase-orders",
        icon: ShoppingCart,
        module: PHARMA_MODULES.PROCUREMENT,
        screen: PHARMA_SCREENS.PURCHASE_ORDERS,
      },
      {
        title: "Goods Receipts",
        href: "/dashboard/procurement/goods-receipts",
        icon: Package,
        module: PHARMA_MODULES.PROCUREMENT,
        screen: PHARMA_SCREENS.GOODS_RECEIPTS,
      },
      {
        title: "Certificate of Analysis",
        href: "/dashboard/procurement/coa",
        icon: FileText,
        module: PHARMA_MODULES.PROCUREMENT,
        screen: PHARMA_SCREENS.CERTIFICATE_OF_ANALYSIS,
      },
    ],
  },
  {
    title: "Manufacturing",
    icon: Factory,
    module: PHARMA_MODULES.MANUFACTURING,
    items: [
      {
        title: "Bill of Materials",
        href: "/dashboard/manufacturing/boms",
        icon: FileText,
        module: PHARMA_MODULES.MANUFACTURING,
        screen: PHARMA_SCREENS.BILL_OF_MATERIALS,
      },
      {
        title: "Work Orders",
        href: "/dashboard/manufacturing/work-orders",
        icon: Factory,
        module: PHARMA_MODULES.MANUFACTURING,
        screen: PHARMA_SCREENS.WORK_ORDERS,
      },
      {
        title: "Batches",
        href: "/dashboard/manufacturing/batches",
        icon: Package,
        module: PHARMA_MODULES.MANUFACTURING,
        screen: PHARMA_SCREENS.BATCHES,
      },
      {
        title: "Batch Consumptions",
        href: "/dashboard/manufacturing/consumptions",
        icon: Package,
        module: PHARMA_MODULES.MANUFACTURING,
        screen: PHARMA_SCREENS.BATCH_CONSUMPTIONS,
      },
      {
        title: "Electronic Batch Records",
        href: "/dashboard/manufacturing/ebr",
        icon: FileText,
        module: PHARMA_MODULES.MANUFACTURING,
        screen: PHARMA_SCREENS.ELECTRONIC_BATCH_RECORDS,
      },
    ],
  },
  {
    title: "Quality Control",
    icon: FlaskConical,
    module: PHARMA_MODULES.QUALITY_CONTROL,
    items: [
      {
        title: "QC Tests",
        href: "/dashboard/quality/qc-tests",
        icon: FlaskConical,
        module: PHARMA_MODULES.QUALITY_CONTROL,
        screen: PHARMA_SCREENS.QC_TESTS,
      },
      {
        title: "Sample Requests",
        href: "/dashboard/quality/samples",
        icon: Package,
        module: PHARMA_MODULES.QUALITY_CONTROL,
        screen: PHARMA_SCREENS.SAMPLE_REQUESTS,
      },
      {
        title: "Sample Results",
        href: "/dashboard/quality/sample-results",
        icon: CheckCircle,
        module: PHARMA_MODULES.QUALITY_CONTROL,
        screen: PHARMA_SCREENS.SAMPLE_RESULTS,
      },
    ],
  },
  {
    title: "Quality Assurance",
    icon: CheckCircle,
    module: PHARMA_MODULES.QUALITY_ASSURANCE,
    items: [
      {
        title: "QA Releases",
        href: "/dashboard/quality/qa-releases",
        icon: CheckCircle,
        module: PHARMA_MODULES.QUALITY_ASSURANCE,
        screen: PHARMA_SCREENS.QA_RELEASES,
      },
      {
        title: "Deviations",
        href: "/dashboard/quality/deviations",
        icon: FileText,
        module: PHARMA_MODULES.QUALITY_ASSURANCE,
        screen: PHARMA_SCREENS.DEVIATIONS,
      },
    ],
  },
  {
    title: "Warehouse",
    icon: Warehouse,
    module: PHARMA_MODULES.WAREHOUSE,
    items: [
      {
        title: "Inventory",
        href: "/dashboard/warehouse/inventory",
        icon: Package,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.INVENTORY,
      },
      {
        title: "Stock Movements",
        href: "/dashboard/warehouse/movements",
        icon: TrendingUp,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.STOCK_MOVEMENTS,
      },
      {
        title: "Locations",
        href: "/dashboard/warehouse/locations",
        icon: Store,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.WAREHOUSE_LOCATIONS,
      },
      {
        title: "Temperature Logs",
        href: "/dashboard/warehouse/temperature",
        icon: TrendingUp,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.TEMPERATURE_LOGS,
      },
      {
        title: "Cycle Counts",
        href: "/dashboard/warehouse/cycle-counts",
        icon: Package,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.CYCLE_COUNTS,
      },
      {
        title: "Labels & Barcodes",
        href: "/dashboard/warehouse/labels",
        icon: FileText,
        module: PHARMA_MODULES.WAREHOUSE,
        screen: PHARMA_SCREENS.LABELS_BARCODES,
      },
    ],
  },
  {
    title: "Distribution",
    icon: Truck,
    module: PHARMA_MODULES.DISTRIBUTION,
    items: [
      {
        title: "Sales Orders",
        href: "/dashboard/distribution/sales-orders",
        icon: ShoppingCart,
        module: PHARMA_MODULES.DISTRIBUTION,
        screen: PHARMA_SCREENS.SALES_ORDERS,
      },
      {
        title: "Shipments",
        href: "/dashboard/distribution/shipments",
        icon: Truck,
        module: PHARMA_MODULES.DISTRIBUTION,
        screen: PHARMA_SCREENS.SHIPMENTS,
      },
      {
        title: "Shipment Items",
        href: "/dashboard/distribution/shipment-items",
        icon: Package,
        module: PHARMA_MODULES.DISTRIBUTION,
        screen: PHARMA_SCREENS.SHIPMENT_ITEMS,
      },
      {
        title: "Cold Chain",
        href: "/dashboard/distribution/cold-chain",
        icon: TrendingUp,
        module: PHARMA_MODULES.DISTRIBUTION,
        screen: PHARMA_SCREENS.COLD_CHAIN,
      },
      {
        title: "Proof of Delivery",
        href: "/dashboard/distribution/pod",
        icon: CheckCircle,
        module: PHARMA_MODULES.DISTRIBUTION,
        screen: PHARMA_SCREENS.PROOF_OF_DELIVERY,
      },
    ],
  },
  {
    title: "Sales/CRM",
    icon: TrendingUp,
    module: PHARMA_MODULES.SALES,
    items: [
      {
        title: "Accounts",
        href: "/dashboard/sales/accounts",
        icon: Building2,
        module: PHARMA_MODULES.SALES,
        screen: PHARMA_SCREENS.ACCOUNTS,
      },
      {
        title: "Activities",
        href: "/dashboard/sales/activities",
        icon: TrendingUp,
        module: PHARMA_MODULES.SALES,
        screen: PHARMA_SCREENS.ACTIVITIES,
      },
      {
        title: "Contracts",
        href: "/dashboard/sales/contracts",
        icon: FileText,
        module: PHARMA_MODULES.SALES,
        screen: PHARMA_SCREENS.CONTRACTS,
      },
      {
        title: "Point of Sale",
        href: "/dashboard/sales/pos",
        icon: ShoppingCart,
        module: PHARMA_MODULES.SALES,
        screen: PHARMA_SCREENS.POINT_OF_SALE,
      },
    ],
  },
  {
    title: "Regulatory",
    icon: FileText,
    module: PHARMA_MODULES.REGULATORY,
    items: [
      {
        title: "Documents",
        href: "/dashboard/regulatory/documents",
        icon: FileText,
        module: PHARMA_MODULES.REGULATORY,
        screen: PHARMA_SCREENS.REGULATORY_DOCUMENTS,
      },
      {
        title: "Approvals",
        href: "/dashboard/regulatory/approvals",
        icon: CheckCircle,
        module: PHARMA_MODULES.REGULATORY,
        screen: PHARMA_SCREENS.DOCUMENT_APPROVALS,
      },
      {
        title: "Training Records",
        href: "/dashboard/regulatory/training",
        icon: User,
        module: PHARMA_MODULES.REGULATORY,
        screen: PHARMA_SCREENS.TRAINING_RECORDS,
      },
    ],
  },
  {
    title: "Reporting",
    icon: BarChart3,
    module: PHARMA_MODULES.REPORTING,
    items: [
      {
        title: "Executive Dashboards",
        href: "/dashboard/reports/executive",
        icon: BarChart3,
        module: PHARMA_MODULES.REPORTING,
        screen: PHARMA_SCREENS.EXECUTIVE_DASHBOARDS,
      },
      {
        title: "Data Exports",
        href: "/dashboard/reports/exports",
        icon: FileText,
        module: PHARMA_MODULES.REPORTING,
        screen: PHARMA_SCREENS.DATA_EXPORTS,
      },
      {
        title: "Scheduled Reports",
        href: "/dashboard/reports/scheduled",
        icon: BarChart3,
        module: PHARMA_MODULES.REPORTING,
        screen: PHARMA_SCREENS.SCHEDULED_REPORTS,
      },
      {
        title: "Recall Coverage",
        href: "/dashboard/reports/recall",
        icon: FileText,
        module: PHARMA_MODULES.REPORTING,
        screen: PHARMA_SCREENS.RECALL_COVERAGE,
      },
    ],
  },
]

interface EnhancedSidebarProps {
  className?: string
}

export function EnhancedSidebar({ className }: EnhancedSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const pathname = usePathname()
  const { canAccessModule, getAccessibleModules } = useEnhancedPermissions()

  // Get accessible modules
  const accessibleModules = getAccessibleModules()

  // Filter navigation groups based on module access
  const accessibleGroups = navigationGroups.filter(group => 
    canAccessModule(group.module)
  )

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle)
      } else {
        newSet.add(groupTitle)
      }
      return newSet
    })
  }

  const isGroupExpanded = (groupTitle: string) => {
    return expandedGroups.has(groupTitle)
  }

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Pharma System</h1>
            <p className="text-xs text-gray-500">Enhanced Permissions</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {accessibleGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.title)}
              className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="flex items-center space-x-2">
                <group.icon className="h-4 w-4" />
                <span>{group.title}</span>
              </div>
              {isGroupExpanded(group.title) ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {/* Group Items */}
            {isGroupExpanded(group.title) && (
              <div className="ml-6 space-y-1">
                {group.items.map((item) => (
                  <PermissionNavItem
                    key={item.href}
                    module={item.module}
                    screen={item.screen}
                    fallback={null}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors",
                        isActive(item.href) && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </PermissionNavItem>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <User className="h-4 w-4" />
          <span>Enhanced Permissions Active</span>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {accessibleModules.length} modules accessible
        </div>
      </div>
    </div>
  )
}

// Mobile sidebar version
export function EnhancedMobileSidebar({ className }: EnhancedSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { canAccessModule, getAccessibleModules } = useEnhancedPermissions()

  const accessibleModules = getAccessibleModules()
  const accessibleGroups = navigationGroups.filter(group => 
    canAccessModule(group.module)
  )

  const isActive = (href: string) => {
    return pathname === href
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg">
            <EnhancedSidebar className="h-full" />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
