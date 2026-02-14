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
  TestTube, 
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Beaker,
  Microscope,
  Activity,
  Target,
  FileCheck,
  Send
} from "lucide-react"
import Link from "next/link"
import { qualityControlApi } from "@/services"
import { formatDateISO } from "@/lib/utils"
import { toast } from "@/lib/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { QCTestResult } from "@/types/quality-control"

export default function QCResultsPage() {
  const [qcResults, setQcResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resultToDelete, setResultToDelete] = useState<any>(null)

  useEffect(() => {
    fetchQCResults()
  }, [searchQuery])

  const fetchQCResults = async () => {
    try {
      setLoading(true)
      const response = await qualityControlApi.getQCResults({
        search: searchQuery || undefined,
      })
      setQcResults(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error("Failed to fetch QC results:", error)
      toast.error("Failed to fetch QC results", "Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (result: any) => {
    setResultToDelete(result)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!resultToDelete) return
    
    try {
      await qualityControlApi.deleteQCResult(resultToDelete.id.toString())
      toast.success("QC result deleted successfully", `Result has been deleted.`)
      fetchQCResults()
    } catch (error) {
      console.error("Failed to delete QC result:", error)
      toast.error("Failed to delete QC result", "Please try again later.")
    } finally {
      setDeleteDialogOpen(false)
      setResultToDelete(null)
    }
  }

  const getStatusBadge = (passed: boolean) => {
    if (passed) {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
    }
  }

  const calculateStats = () => {
    const total = qcResults.length
    const passed = qcResults.filter(result => result.passed).length
    const failed = qcResults.filter(result => !result.passed).length
    const pending = qcResults.filter(result => !result.testedAt).length

    return { total, passed, failed, pending }
  }

  const stats = calculateStats()

  const columns = [
    {
      key: "id",
      header: "Result ID",
      render: (result: any) => (
        <div className="font-mono text-sm font-medium text-orange-600">
          #{result.id}
        </div>
      ),
    },
    {
      key: "test",
      header: "Test",
      render: (result: any) => (
        <div>
          <div className="font-medium">{result.testName || result.test?.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            {result.parameter || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "sample",
      header: "Sample",
      render: (result: any) => (
        <div className="text-sm">
          {result.sampleCode || result.sample?.sampleCode || "N/A"}
        </div>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (result: any) => (
        <div>
          <div className="font-medium">{result.resultValue} {result.unit}</div>
          <div className="text-sm text-muted-foreground">
            Spec: {result.specification || "N/A"}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (result: any) => getStatusBadge(result.passed),
    },
    {
      key: "testedBy",
      header: "Tested By",
      render: (result: any) => (
        <div className="text-sm">
          {result.testedByName || result.testedBy || "N/A"}
        </div>
      ),
    },
    {
      key: "testedAt",
      header: "Tested At",
      render: (result: any) => (
        <div className="text-sm">
          {result.testedAt ? formatDateISO(result.testedAt) : "Pending"}
        </div>
      ),
    },
    {
      key: "reviewedAt",
      header: "Reviewed",
      render: (result: any) => (
        <div className="text-sm">
          {result.reviewedAt ? formatDateISO(result.reviewedAt) : "Not reviewed"}
        </div>
      ),
    },
  ]

  const actions = (result: any) => (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/quality/qc-results/${result.id}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.href = `/dashboard/quality/qc-results/${result.id}/edit`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteClick(result)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QC Results</h1>
            <p className="text-muted-foreground">Manage quality control test results</p>
          </div>
          <Link href="/dashboard/quality/qc-results/new">
            <Button>
              <Plus />
              Add Result
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* QC Results Table */}
        <UnifiedDataTable
          data={qcResults}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search QC results..."
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          actions={actions}
          onRefresh={fetchQCResults}
          onExport={() => console.log("Export QC results")}
          emptyMessage="No QC results found. Create your first result to get started."
        />

        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete QC Result"
          description={`Are you sure you want to delete this QC result? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </DashboardLayout>
  )
}

