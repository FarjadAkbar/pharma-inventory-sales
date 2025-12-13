"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth.context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Settings, User } from "lucide-react"
import { StoreSwitcher } from "./store-switcher"
import { SiteSelector } from "./site-selector"
import { useRouter } from "next/navigation"
import { sitesApi } from "@/services"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [currentSite, setCurrentSite] = useState<any>(null)
  const [availableSites, setAvailableSites] = useState<any[]>([])
  const [loadingSites, setLoadingSites] = useState(true)

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoadingSites(true)
        const response: any = await sitesApi.getSites()
        const sitesData = Array.isArray(response) ? response : (response?.docs || response?.data || [])
        
        // Filter sites based on user role and assigned sites
        if (!user) {
          setAvailableSites([])
          return
        }

        // Admin users don't have sites assigned, but can view all sites
        const userRole = user.role?.toLowerCase() || ''
        const isAdmin = userRole.includes('admin') || userRole === 'system administrator'
        
        if (isAdmin) {
          // Admin can view all sites
          setAvailableSites(sitesData.filter((s: any) => s.isActive))
        } else {
          // Other users can only view their assigned sites
          const userSiteIds = (user as any).siteIds || (user as any).sites?.map((s: any) => s.id) || []
          if (userSiteIds.length > 0) {
            setAvailableSites(sitesData.filter((s: any) => userSiteIds.includes(s.id) && s.isActive))
          } else {
            setAvailableSites([])
          }
        }

        // Set current site to first available site if not already set
        if (availableSites.length > 0 && !currentSite) {
          setCurrentSite(availableSites[0])
        } else if (availableSites.length === 0) {
          setCurrentSite(null)
        }
      } catch (error) {
        console.error("Failed to fetch sites:", error)
        setAvailableSites([])
      } finally {
        setLoadingSites(false)
      }
    }

    if (user) {
      fetchSites()
    }
  }, [user])

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSiteChange = (site: any) => {
    setCurrentSite(site)
    // In real implementation, this would update the user context and refresh data
    console.log("Site changed to:", site)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-foreground">Welcome back, {user?.fullname || user?.username || 'User'}</h1>
      </div>

      <div className="flex items-center gap-4">
        <SiteSelector
          currentSite={currentSite}
          availableSites={availableSites}
          onSiteChange={handleSiteChange}
          userRole={user?.role || 'employee'}
        />
        <StoreSwitcher />
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.fullname || user?.username ? getInitials(user.fullname || user.username || 'User') : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullname || user?.username || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground capitalize">Role: {user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { window.dispatchEvent(new Event("api:request:start")); router.push("/dashboard/profile"); setTimeout(() => window.dispatchEvent(new Event("api:request:stop")), 800) }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { window.dispatchEvent(new Event("api:request:start")); router.push("/auth/change-password"); setTimeout(() => window.dispatchEvent(new Event("api:request:stop")), 800) }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
