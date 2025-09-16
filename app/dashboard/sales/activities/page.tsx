"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Phone, Mail, User, CheckCircle, Clock } from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface Activity {
  id: string
  title: string
  type: "call" | "email" | "meeting" | "visit" | "follow_up" | "demo" | "proposal"
  accountId: string
  accountName: string
  contactPerson: string
  assignedTo: string
  assignedToName: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "rescheduled"
  priority: "low" | "medium" | "high" | "urgent"
  scheduledDate: string
  completedDate?: string
  duration: number // minutes
  description: string
  outcome?: string
  nextAction?: string
  createdAt: string
  updatedAt: string
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchActivities()
  }, [searchQuery, pagination.page, typeFilter, statusFilter])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const response = await apiService.getActivities({
        search: searchQuery,
        type: typeFilter !== "all" ? typeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        const activityData = response.data as {
          activities: Activity[]
          pagination: { page: number; pages: number; total: number }
        }
        setActivities(activityData.activities || [])
        setPagination(activityData.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleEdit = (activity: Activity) => {
    window.location.href = `/dashboard/sales/activities/${activity.id}`
  }

  const handleDelete = async (activity: Activity) => {
    if (confirm(`Are you sure you want to delete activity "${activity.title}"?`)) {
      try {
        await apiService.deleteActivity(activity.id)
        fetchActivities()
      } catch (error) {
        console.error("Failed to delete activity:", error)
      }
    }
  }

  const handleComplete = async (activity: Activity) => {
    try {
      await apiService.completeActivity(activity.id)
      fetchActivities()
    } catch (error) {
      console.error("Failed to complete activity:", error)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "call":
        return "bg-blue-100 text-blue-800"
      case "email":
        return "bg-green-100 text-green-800"
      case "meeting":
        return "bg-purple-100 text-purple-800"
      case "visit":
        return "bg-orange-100 text-orange-800"
      case "follow_up":
        return "bg-yellow-100 text-yellow-800"
      case "demo":
        return "bg-pink-100 text-pink-800"
      case "proposal":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "rescheduled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />
      case "email":
        return <Mail className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "visit":
        return <User className="h-4 w-4" />
      case "follow_up":
        return <Clock className="h-4 w-4" />
      case "demo":
        return <User className="h-4 w-4" />
      case "proposal":
        return <User className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const calculateStats = () => {
    const totalActivities = activities.length
    const scheduledActivities = activities.filter(a => a.status === "scheduled").length
    const completedActivities = activities.filter(a => a.status === "completed").length
    const overdueActivities = activities.filter(a => {
      const scheduled = new Date(a.scheduledDate)
      const now = new Date()
      return scheduled < now && a.status !== "completed"
    }).length

    return { totalActivities, scheduledActivities, completedActivities, overdueActivities }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "title",
      header: "Activity",
      render: (activity: Activity) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {getTypeIcon(activity.type)}
          </div>
          <div>
            <div className="font-medium">{activity.title}</div>
            <div className="text-sm text-muted-foreground">{activity.accountName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (activity: Activity) => (
        <Badge className={getTypeBadgeColor(activity.type)}>
          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1).replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (activity: Activity) => (
        <div className="text-sm">
          <div className="font-medium">{activity.contactPerson}</div>
          <div className="text-muted-foreground">Assigned: {activity.assignedToName}</div>
        </div>
      ),
    },
    {
      key: "scheduledDate",
      header: "Scheduled",
      render: (activity: Activity) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>{formatDateISO(activity.scheduledDate)}</span>
          </div>
          <div className="text-muted-foreground">{activity.duration} minutes</div>
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (activity: Activity) => (
        <Badge className={getPriorityBadgeColor(activity.priority)}>
          {activity.priority.charAt(0).toUpperCase() + activity.priority.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (activity: Activity) => (
        <Badge className={getStatusBadgeColor(activity.status)}>
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1).replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (activity: Activity) => (
        <div className="text-sm">
          {activity.outcome ? (
            <div className="truncate max-w-32">{activity.outcome}</div>
          ) : (
            <span className="text-muted-foreground">No outcome</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Activities</h1>
            <p className="text-muted-foreground">Manage sales activities and customer interactions</p>
          </div>

          <PermissionGuard module="SALES" screen="activities" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/sales/activities/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduledActivities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedActivities}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdueActivities}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter activities by type and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Types" },
                    { value: "call", label: "Call" },
                    { value: "email", label: "Email" },
                    { value: "meeting", label: "Meeting" },
                    { value: "visit", label: "Visit" },
                    { value: "follow_up", label: "Follow Up" },
                    { value: "demo", label: "Demo" },
                    { value: "proposal", label: "Proposal" },
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={typeFilter === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTypeFilter(type.value)}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All Status" },
                    { value: "scheduled", label: "Scheduled" },
                    { value: "in_progress", label: "In Progress" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                    { value: "rescheduled", label: "Rescheduled" },
                  ].map((status) => (
                    <Button
                      key={status.value}
                      variant={statusFilter === status.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status.value)}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sales Activities</CardTitle>
            <CardDescription>A list of all sales activities with their status and outcomes.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={activities}
              columns={columns}
              loading={loading}
              onSearch={handleSearch}
              pagination={{
                page: pagination.page,
                pages: pagination.pages,
                total: pagination.total,
                onPageChange: handlePageChange
              }}
              searchPlaceholder="Search activities..."
              actions={(activity: Activity) => (
                <div className="flex items-center gap-2">
                  <PermissionGuard module="SALES" screen="activities" action="update">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
                      Edit
                    </Button>
                  </PermissionGuard>
                  {activity.status === "scheduled" && (
                    <PermissionGuard module="SALES" screen="activities" action="update">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleComplete(activity)}
                        className="text-green-600"
                      >
                        Complete
                      </Button>
                    </PermissionGuard>
                  )}
                  <PermissionGuard module="SALES" screen="activities" action="delete">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(activity)}>
                      Delete
                    </Button>
                  </PermissionGuard>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
