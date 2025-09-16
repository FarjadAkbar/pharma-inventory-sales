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
  id: string
  name: string
  address: string
  city: string
  country: string
  type: 'hospital' | 'clinic' | 'pharmacy' | 'warehouse' | 'manufacturing'
  isActive: boolean
  userCount: number
  inventoryCount: number
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

  const getSiteIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Building2 className="h-4 w-4 text-blue-500" />
      case 'clinic':
        return <Building2 className="h-4 w-4 text-green-500" />
      case 'pharmacy':
        return <Package className="h-4 w-4 text-purple-500" />
      case 'warehouse':
        return <Package className="h-4 w-4 text-orange-500" />
      case 'manufacturing':
        return <Settings className="h-4 w-4 text-red-500" />
      default:
        return <Building2 className="h-4 w-4 text-gray-500" />
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
      <div className={cn("flex items-center gap-2", className)}>
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
            "h-auto p-2 hover:bg-muted/50",
            className
          )}
        >
          <div className="flex items-center gap-2">
            {getSiteIcon(currentSite?.type || 'warehouse')}
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{currentSite?.name || 'Select Site'}</span>
              <span className="text-xs text-muted-foreground">
                {currentSite?.city || 'Unknown Location'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Switch Site</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableSites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => handleSiteSelect(site)}
            className="p-3 cursor-pointer"
          >
            <div className="flex items-start gap-3 w-full">
              <div className="flex-shrink-0 mt-0.5">
                {getSiteIcon(site.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{site.name}</span>
                  {currentSite?.id === site.id && (
                    <Check className="h-3 w-3 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {site.address}, {site.city}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {getSiteTypeLabel(site.type)}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {site.userCount} users
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {site.inventoryCount} items
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-center text-muted-foreground">
          <span className="text-xs">
            {availableSites.length} site{availableSites.length !== 1 ? 's' : ''} available
          </span>
        </DropdownMenuItem>
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
