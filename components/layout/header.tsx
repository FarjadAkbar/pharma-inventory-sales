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
import { SiteSelector, mockSites } from "./site-selector"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [currentSite, setCurrentSite] = useState(mockSites[0])
  const [availableSites, setAvailableSites] = useState(mockSites)

  useEffect(() => {
    // In real implementation, this would come from user context or API
    // Filter sites based on user role and assigned sites
    if (user?.role === 'site_manager') {
      // Site managers can only access their assigned sites
      setAvailableSites(mockSites.slice(0, 2)) // Example: first 2 sites
    } else if (user?.role === 'org_admin') {
      // Org admins can access all sites in their organization
      setAvailableSites(mockSites.slice(0, 4)) // Example: first 4 sites
    } else {
      // System admins can access all sites
      setAvailableSites(mockSites)
    }
  }, [user?.role])

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
        <h1 className="text-xl font-semibold text-foreground">Welcome back, {user?.name}</h1>
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
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
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
