"use client"

import { useAuth } from "@/contexts/auth.context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Building2, Users, TrendingUp, DollarSign } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: "Total Products",
      value: "1,234",
      description: "Active products in inventory",
      icon: Package,
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Total Sales",
      value: "$45,231",
      description: "Revenue this month",
      icon: DollarSign,
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Active Vendors",
      value: "89",
      description: "Registered vendors",
      icon: Building2,
      trend: { value: 3, isPositive: true },
    },
    {
      title: "System Users",
      value: "24",
      description: "Active user accounts",
      icon: Users,
      trend: { value: 2, isPositive: true },
    },
  ]

  // Filter stats based on user role
  const getVisibleStats = () => {
    if (user?.role === "admin") return stats
    if (user?.role === "manager") return stats.slice(0, 3)
    return stats.slice(0, 2) // user role
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's what's happening with your CRM system.
          </p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details and access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <p className="text-lg font-semibold capitalize">{user?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getVisibleStats().map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks based on your role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {user?.role === "admin" && (
                  <>
                    <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Add User</span>
                      </div>
                    </Card>
                    <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">View Reports</span>
                      </div>
                    </Card>
                  </>
                )}
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Add Product</span>
                  </div>
                </Card>
                <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm font-medium">New Sale</span>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
