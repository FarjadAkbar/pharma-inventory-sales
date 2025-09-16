"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Building2, 
  Search, 
  Check, 
  ArrowRight,
  Globe,
  Shield,
  Users,
  Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

interface Organization {
  id: string
  name: string
  code: string
  type: 'hospital' | 'clinic' | 'pharmacy' | 'distributor' | 'manufacturer'
  description: string
  logo?: string
  isActive: boolean
  sites: Site[]
}

interface Site {
  id: string
  name: string
  address: string
  city: string
  country: string
  isActive: boolean
}

interface OrganizationSelectorProps {
  onSelect: (organization: Organization, site?: Site) => void
  onBack?: () => void
  className?: string
}

const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Ziauddin Hospital",
    code: "ZH",
    type: "hospital",
    description: "Leading healthcare provider with multiple locations",
    isActive: true,
    sites: [
      {
        id: "1",
        name: "Ziauddin Hospital - Clifton",
        address: "4/B, Block 6, PECHS, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
      {
        id: "2",
        name: "Ziauddin Hospital - North Nazimabad",
        address: "Plot No. 1, Block A, North Nazimabad, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
      {
        id: "3",
        name: "Ziauddin Hospital - Kemari",
        address: "Plot No. 1, Block 1, Kemari, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
    ],
  },
  {
    id: "2",
    name: "Aga Khan University Hospital",
    code: "AKUH",
    type: "hospital",
    description: "Premier medical institution with international standards",
    isActive: true,
    sites: [
      {
        id: "4",
        name: "AKUH - Main Campus",
        address: "Stadium Road, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
    ],
  },
  {
    id: "3",
    name: "Shifa International Hospital",
    code: "SIH",
    type: "hospital",
    description: "Modern healthcare facility with advanced technology",
    isActive: true,
    sites: [
      {
        id: "5",
        name: "Shifa International - Islamabad",
        address: "H-8/4, Islamabad",
        city: "Islamabad",
        country: "Pakistan",
        isActive: true,
      },
    ],
  },
  {
    id: "4",
    name: "Pharma Distributors Ltd",
    code: "PDL",
    type: "distributor",
    description: "Leading pharmaceutical distribution company",
    isActive: true,
    sites: [
      {
        id: "6",
        name: "PDL - Karachi Warehouse",
        address: "Industrial Area, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
      {
        id: "7",
        name: "PDL - Lahore Distribution Center",
        address: "Industrial Estate, Lahore",
        city: "Lahore",
        country: "Pakistan",
        isActive: true,
      },
    ],
  },
  {
    id: "5",
    name: "MediCare Pharmaceuticals",
    code: "MCP",
    type: "manufacturer",
    description: "Pharmaceutical manufacturing and research company",
    isActive: true,
    sites: [
      {
        id: "8",
        name: "MCP - Manufacturing Plant",
        address: "Pharmaceutical Zone, Karachi",
        city: "Karachi",
        country: "Pakistan",
        isActive: true,
      },
    ],
  },
]

export function OrganizationSelector({ onSelect, onBack, className }: OrganizationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [filteredOrgs, setFilteredOrgs] = useState(mockOrganizations)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    const filtered = mockOrganizations.filter(org =>
      org.name.toLowerCase().includes(query.toLowerCase()) ||
      org.code.toLowerCase().includes(query.toLowerCase()) ||
      org.description.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredOrgs(filtered)
  }

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org)
    setSelectedSite(null)
  }

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site)
  }

  const handleContinue = () => {
    if (selectedOrg) {
      onSelect(selectedOrg, selectedSite || undefined)
    }
  }

  const getOrgIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Shield className="h-6 w-6 text-blue-500" />
      case 'clinic':
        return <Users className="h-6 w-6 text-green-500" />
      case 'pharmacy':
        return <Package className="h-6 w-6 text-purple-500" />
      case 'distributor':
        return <Building2 className="h-6 w-6 text-orange-500" />
      case 'manufacturer':
        return <Building2 className="h-6 w-6 text-red-500" />
      default:
        return <Globe className="h-6 w-6 text-gray-500" />
    }
  }

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'Hospital'
      case 'clinic':
        return 'Clinic'
      case 'pharmacy':
        return 'Pharmacy'
      case 'distributor':
        return 'Distributor'
      case 'manufacturer':
        return 'Manufacturer'
      default:
        return 'Organization'
    }
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Select Organization</CardTitle>
          <CardDescription>
            Choose your organization and site to access the pharmaceutical system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Organization List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredOrgs.map((org) => (
              <Card
                key={org.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedOrg?.id === org.id && "ring-2 ring-primary"
                )}
                onClick={() => handleOrgSelect(org)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getOrgIcon(org.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{org.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {org.code}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {getOrgTypeLabel(org.type)}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {org.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Building2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {org.sites.length} site{org.sites.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    {selectedOrg?.id === org.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Site Selection */}
          {selectedOrg && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Select Site (Optional)</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedOrg.sites.map((site) => (
                    <Card
                      key={site.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-sm",
                        selectedSite?.id === site.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSiteSelect(site)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-sm">{site.name}</h5>
                            <p className="text-xs text-muted-foreground">
                              {site.address}, {site.city}
                            </p>
                          </div>
                          {selectedSite?.id === site.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={!selectedOrg}
              className="ml-auto"
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
