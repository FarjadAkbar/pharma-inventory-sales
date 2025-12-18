"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UnifiedDataTable } from "@/components/ui/unified-data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Plus, 
  GraduationCap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Award,
  BookOpen
} from "lucide-react"
import { apiService } from "@/services/api.service"
import { formatDateISO } from "@/lib/utils"
import { PermissionGuard } from "@/components/auth/permission-guard"

interface TrainingRecord {
  id: string
  recordNumber: string
  employeeId: string
  employeeName: string
  trainingType: "safety" | "compliance" | "technical" | "regulatory" | "gmp" | "sop" | "equipment"
  trainingTitle: string
  description: string
  status: "scheduled" | "in_progress" | "completed" | "failed" | "expired" | "cancelled"
  priority: "low" | "normal" | "high" | "urgent"
  scheduledDate: string
  completedDate?: string
  expiryDate?: string
  duration: number // in hours
  instructor?: string
  instructorName?: string
  location: string
  method: "classroom" | "online" | "on_job" | "workshop" | "seminar"
  score?: number
  passingScore: number
  certificateNumber?: string
  certificateUrl?: string
  renewalRequired: boolean
  renewalPeriod: number // in months
  requirements: string[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function TrainingRecordsPage() {
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  useEffect(() => {
    fetchTrainingRecords()
  }, [searchQuery, pagination.page, filters])

  const fetchTrainingRecords = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTrainingRecords({
        search: searchQuery,
        ...filters,
        page: pagination.page,
        limit: 10,
      })

      if (response.success && response.data) {
        setTrainingRecords(response.data.trainingRecords || [])
        setPagination(response.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (error) {
      console.error("Failed to fetch training records:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleView = (record: TrainingRecord) => {
    console.log("View training record:", record)
  }

  const handleEdit = (record: TrainingRecord) => {
    console.log("Edit training record:", record)
  }

  const handleDownloadCertificate = async (record: TrainingRecord) => {
    if (record.certificateUrl) {
      try {
        await apiService.downloadFile(record.certificateUrl, `certificate-${record.certificateNumber}.pdf`)
      } catch (error) {
        console.error("Failed to download certificate:", error)
      }
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
      case "failed":
        return "bg-red-100 text-red-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "normal":
        return "bg-blue-100 text-blue-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "safety":
        return "bg-red-100 text-red-800"
      case "compliance":
        return "bg-blue-100 text-blue-800"
      case "technical":
        return "bg-green-100 text-green-800"
      case "regulatory":
        return "bg-purple-100 text-purple-800"
      case "gmp":
        return "bg-orange-100 text-orange-800"
      case "sop":
        return "bg-yellow-100 text-yellow-800"
      case "equipment":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isTrainingExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isTrainingExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const calculateStats = () => {
    const total = trainingRecords.length
    const completed = trainingRecords.filter(t => t.status === "completed").length
    const inProgress = trainingRecords.filter(t => t.status === "in_progress").length
    const scheduled = trainingRecords.filter(t => t.status === "scheduled").length
    const expiring = trainingRecords.filter(t => t.expiryDate && isTrainingExpiringSoon(t.expiryDate)).length
    const expired = trainingRecords.filter(t => t.expiryDate && isTrainingExpired(t.expiryDate)).length

    return { total, completed, inProgress, scheduled, expiring, expired }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "employee",
      header: "Employee",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{record.employeeName}</div>
            <div className="text-sm text-muted-foreground">{record.recordNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "training",
      header: "Training",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div>
          <div className="font-medium">{record.trainingTitle}</div>
          <div className="text-sm text-muted-foreground">{record.description}</div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="space-y-1">
          <Badge className={getTypeBadgeColor(record.trainingType)}>
            {record.trainingType.toUpperCase()}
          </Badge>
          <Badge className={getPriorityBadgeColor(record.priority)}>
            {record.priority.charAt(0).toUpperCase() + record.priority.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="space-y-1">
          <Badge className={getStatusBadgeColor(record.status)}>
            {record.status.replace("_", " ").charAt(0).toUpperCase() + record.status.replace("_", " ").slice(1)}
          </Badge>
          {record.score !== undefined && (
            <div className="text-sm">
              Score: {record.score}/{record.passingScore}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Scheduled: {formatDateISO(record.scheduledDate)}</span>
          </div>
          {record.completedDate && (
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Completed: {formatDateISO(record.completedDate)}</span>
            </div>
          )}
          {record.expiryDate && (
            <div className={`flex items-center gap-1 ${
              isTrainingExpired(record.expiryDate) ? "text-red-600" : 
              isTrainingExpiringSoon(record.expiryDate) ? "text-yellow-600" : ""
            }`}>
              <Calendar className="h-3 w-3" />
              <span>Expires: {formatDateISO(record.expiryDate)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{record.duration}h</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{record.method.replace("_", " ").charAt(0).toUpperCase() + record.method.replace("_", " ").slice(1)}</span>
          </div>
          <div className="text-muted-foreground">{record.location}</div>
        </div>
      ),
    },
    {
      key: "instructor",
      header: "Instructor",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="text-sm">
          {record.instructorName ? (
            <div className="font-medium">{record.instructorName}</div>
          ) : (
            <span className="text-muted-foreground">TBD</span>
          )}
        </div>
      ),
    },
    {
      key: "certificate",
      header: "Certificate",
      sortable: true,
      render: (record: TrainingRecord) => (
        <div className="text-sm">
          {record.certificateNumber ? (
            <div className="flex items-center gap-1">
              <Award className="h-3 w-3" />
              <span className="font-medium">{record.certificateNumber}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">No certificate</span>
          )}
        </div>
      ),
    },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "scheduled", label: "Scheduled" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "failed", label: "Failed" },
        { value: "expired", label: "Expired" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
    {
      key: "trainingType",
      label: "Training Type",
      type: "select" as const,
      options: [
        { value: "safety", label: "Safety" },
        { value: "compliance", label: "Compliance" },
        { value: "technical", label: "Technical" },
        { value: "regulatory", label: "Regulatory" },
        { value: "gmp", label: "GMP" },
        { value: "sop", label: "SOP" },
        { value: "equipment", label: "Equipment" },
      ],
    },
    {
      key: "priority",
      label: "Priority",
      type: "select" as const,
      options: [
        { value: "urgent", label: "Urgent" },
        { value: "high", label: "High" },
        { value: "normal", label: "Normal" },
        { value: "low", label: "Low" },
      ],
    },
    {
      key: "method",
      label: "Method",
      type: "select" as const,
      options: [
        { value: "classroom", label: "Classroom" },
        { value: "online", label: "Online" },
        { value: "on_job", label: "On Job" },
        { value: "workshop", label: "Workshop" },
        { value: "seminar", label: "Seminar" },
      ],
    },
  ]

  const actions = (record: TrainingRecord) => (
    <div className="flex items-center gap-2">
      <PermissionGuard module="REGULATORY" screen="training" action="view">
        <Button variant="ghost" size="sm" onClick={() => handleView(record)}>
          <Eye className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      <PermissionGuard module="REGULATORY" screen="training" action="update">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
          <Edit className="h-4 w-4" />
        </Button>
      </PermissionGuard>
      {record.certificateUrl && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownloadCertificate(record)}
        >
          <Award className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Training Records</h1>
            <p className="text-muted-foreground">Manage employee training records and certifications</p>
          </div>

          <PermissionGuard module="REGULATORY" screen="training" action="create">
            <Button onClick={() => (window.location.href = "/dashboard/regulatory/training/new")}>
              <Plus />
              New Training
            </Button>
          </PermissionGuard>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expiring}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Training Records Table */}
        <UnifiedDataTable
          data={trainingRecords}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search training records..."
          searchValue={searchQuery}
          onSearch={handleSearch}
          filters={filterOptions}
          onFiltersChange={handleFiltersChange}
          pagination={{
            page: pagination.page,
            pages: pagination.pages,
            total: pagination.total,
            onPageChange: handlePageChange
          }}
          actions={actions}
          onRefresh={fetchTrainingRecords}
          onExport={() => console.log("Export training records")}
          emptyMessage="No training records found. Add your first training record to get started."
        />
      </div>
    </DashboardLayout>
  )
}
