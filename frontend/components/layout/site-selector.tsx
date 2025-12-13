"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Building2, 
  ChevronDown, 
  Check, 
  MapPin,
  Users,
  Package,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Site {
  id: number | string
  name: string
  address?: string
  city?: string
  country?: string
  type?: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing'
  isActive?: boolean
  userCount?: number
  inventoryCount?: number
}

interface SiteSelectorProps {
  currentSite?: Site
  availableSites: Site[]
  onSiteChange: (site: Site) => void
  userRole: string
  className?: string
}

export function SiteSelector({ 
  currentSite, 
  availableSites, 
  onSiteChange, 
  userRole,
  className 
}: SiteSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSiteSelect = (site: Site) => {
    onSiteChange(site)
    setIsOpen(false)
  }

  const getSiteIcon = (type: string, isHovered: boolean = false) => {
    const baseClasses = "h-4 w-4 transition-colors duration-200"
    const hoverClasses = isHovered ? "text-white" : ""
    
    switch (type) {
      case 'hospital':
        return <Building2 className={`${baseClasses} text-blue-500 group-hover:text-white ${hoverClasses}`} />
      case 'clinic':
        return <Building2 className={`${baseClasses} text-green-500 group-hover:text-white ${hoverClasses}`} />
      case 'pharmacy':
        return <Package className={`${baseClasses} text-purple-500 group-hover:text-white ${hoverClasses}`} />
      case 'warehouse':
        return <Package className={`${baseClasses} text-orange-500 group-hover:text-white ${hoverClasses}`} />
      case 'manufacturing':
        return <Settings className={`${baseClasses} text-red-500 group-hover:text-white ${hoverClasses}`} />
      default:
        return <Building2 className={`${baseClasses} text-gray-500 group-hover:text-white ${hoverClasses}`} />
    }
  }

  const getSiteTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'Hospital'
      case 'clinic':
        return 'Clinic'
      case 'pharmacy':
        return 'Pharmacy'
      case 'warehouse':
        return 'Warehouse'
      case 'manufacturing':
        return 'Manufacturing'
      default:
        return 'Site'
    }
  }

  const canChangeSite = () => {
    // System admins can change to any site
    if (userRole === 'system_admin') return true
    
    // Org admins can change to any site in their organization
    if (userRole === 'org_admin') return true
    
    // Site managers can only change within their assigned sites
    if (userRole === 'site_manager') return true
    
    // Other roles have limited or no site changing capabilities
    return false
  }

  if (!canChangeSite() || availableSites.length <= 1) {
    return (
      <div className={cn("flex items-center gap-3 p-3 rounded-md bg-muted/30 border", className)}>
        {getSiteIcon(currentSite?.type || 'warehouse')}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{currentSite?.name || 'No Site'}</span>
          <span className="text-xs text-muted-foreground">
            {currentSite?.city || 'Unknown Location'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-auto p-3 hover:bg-amber-800 hover:border-amber-700 hover:text-white transition-all duration-200 group",
            className
          )}
        >
          <div className="flex items-center gap-3">
            {getSiteIcon(currentSite?.type || 'warehouse')}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium group-hover:text-white">{currentSite?.name || 'Select Site'}</span>
              <span className="text-xs text-muted-foreground group-hover:text-white/80">
                {currentSite?.city || 'Unknown Location'}
              </span>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-muted-foreground group-hover:text-white transition-all duration-200",
              isOpen && "rotate-180"
            )} />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-2" align="end">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold">Switch Site</DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        
        {availableSites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => handleSiteSelect(site)}
            className="p-0 cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-md"
          >
            <div className="flex items-start gap-3 w-full p-3 hover:bg-amber-800 hover:text-white rounded-md transition-colors duration-150 group">
              <div className="flex-shrink-0 mt-0.5">
                {getSiteIcon(site.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-sm truncate group-hover:text-white">{site.name}</span>
                  {currentSite?.id === site.id && (
                    <Check className="h-3 w-3 text-primary group-hover:text-white flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 text-muted-foreground group-hover:text-white flex-shrink-0" />
                  <span className="text-xs text-muted-foreground group-hover:text-white/80 truncate">
                    {site.address}, {site.city}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 group-hover:border-white group-hover:text-white">
                    {getSiteTypeLabel(site.type)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground group-hover:text-white" />
                    <span className="text-xs text-muted-foreground group-hover:text-white/80">
                      {site.userCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-muted-foreground group-hover:text-white" />
                    <span className="text-xs text-muted-foreground group-hover:text-white/80">
                      {site.inventoryCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator className="my-2" />
        <div className="px-2 py-1.5 text-center">
          <span className="text-xs text-muted-foreground">
            {availableSites.length} site{availableSites.length !== 1 ? 's' : ''} available
          </span>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Mock data for demonstration
export const mockSites: Site[] = [
  {
    id: "1",
    name: "Ziauddin Hospital - Clifton",
    address: "4/B, Block 6, PECHS, Karachi",
    city: "Karachi",
    country: "Pakistan",
    type: "hospital",
    isActive: true,
    userCount: 45,
    inventoryCount: 1250,
  },
  {
    id: "2",
    name: "Ziauddin Hospital - North Nazimabad",
    address: "Plot No. 1, Block A, North Nazimabad, Karachi",
    city: "Karachi",
    country: "Pakistan",
    type: "hospital",
    isActive: true,
    userCount: 32,
    inventoryCount: 980,
  },
  {
    id: "3",
    name: "Ziauddin Hospital - Kemari",
    address: "Plot No. 1, Block 1, Kemari, Karachi",
    city: "Karachi",
    country: "Pakistan",
    type: "hospital",
    isActive: true,
    userCount: 28,
    inventoryCount: 750,
  },
  {
    id: "4",
    name: "Central Warehouse - Karachi",
    address: "Industrial Area, Karachi",
    city: "Karachi",
    country: "Pakistan",
    type: "warehouse",
    isActive: true,
    userCount: 15,
    inventoryCount: 5000,
  },
  {
    id: "5",
    name: "Manufacturing Plant - Lahore",
    address: "Pharmaceutical Zone, Lahore",
    city: "Lahore",
    country: "Pakistan",
    type: "manufacturing",
    isActive: true,
    userCount: 25,
    inventoryCount: 2000,
  },
]
