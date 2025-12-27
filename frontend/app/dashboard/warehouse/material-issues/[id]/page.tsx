"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { warehouseApi } from "@/services"
import { toast } from "sonner"
import { formatDateISO } from "@/lib/utils"
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle,
  Clock,
  ShoppingCart,
  ArrowRight,
  CheckSquare
} from "lucide-react"
import type { MaterialIssue } from "@/types/warehouse"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

export default function MaterialIssueDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [issue, setIssue] = useState<MaterialIssue | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'pick' | 'issue' | null>(null)

  useEffect(() => {
    fetchMaterialIssue()
  }, [id])

  const fetchMaterialIssue = async () => {
    try {
      setLoading(true)
      const response = await warehouseApi.getMaterialIssue(id)
      setIssue(response)
    } catch (error: any) {
      toast.error(error.message || "Failed to load material issue")
      router.push("/dashboard/warehouse/material-issues")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = () => {
    setActionType('approve')
    setActionDialogOpen(true)
  }

  const handlePick = () => {
    setActionType('pick')
    setActionDialogOpen(true)
  }

  const handleIssue = () => {
    setActionType('issue')
    setActionDialogOpen(true)
  }

  const handleActionConfirm = async () => {
    if (!issue) return

    try {
      const userId = 1 // TODO: Get from auth context
      
      if (actionType === 'approve') {
        await warehouseApi.approveMaterialIssue(issue.id.toString(), {
          approvedBy: userId,
        })
        toast.success("Material issue approved successfully")
      } else if (actionType === 'pick') {
        await warehouseApi.pickMaterialIssue(issue.id.toString(), userId)
        toast.success("Material issue picked successfully")
      } else if (actionType === 'issue') {
        await warehouseApi.issueMaterial(issue.id.toString(), userId)
        toast.success("Material issued successfully")
      }
      
      fetchMaterialIssue()
      setActionDialogOpen(false)
      setActionType(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to perform action")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Approved":
        return <Badge className="bg-blue-100 text-blue-800"><CheckSquare className="h-3 w-3 mr-1" />Approved</Badge>
      case "Picked":
        return <Badge className="bg-purple-100 text-purple-800"><ShoppingCart className="h-3 w-3 mr-1" />Picked</Badge>
      case "Issued":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Issued</Badge>
      case "Cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading material issue...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!issue) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Material Issue Details</h1>
            <p className="text-muted-foreground">Issue Number: {issue.issueNumber}</p>
          </div>
          <div className="flex items-center gap-2">
            {issue.status === "Pending" && (
              <Button onClick={handleApprove} className="bg-blue-600 hover:bg-blue-700">
                <CheckSquare className="h-4 w-4 mr-2" />
                Approve
              </Button>
            )}
            {issue.status === "Approved" && (
              <Button onClick={handlePick} className="bg-purple-600 hover:bg-purple-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Pick
              </Button>
            )}
            {issue.status === "Picked" && (
              <Button onClick={handleIssue} className="bg-green-600 hover:bg-green-700">
                <ArrowRight className="h-4 w-4 mr-2" />
                Issue
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/dashboard/warehouse/material-issues")}>
              Back to List
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Issue Number</label>
                <div className="font-mono text-lg font-bold">{issue.issueNumber}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(issue.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Material</label>
                <div className="mt-1">
                  <div className="font-medium">{issue.materialName}</div>
                  <div className="text-sm text-muted-foreground">{issue.materialCode}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                <div className="mt-1">{issue.batchNumber || "N/A"}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <div className="mt-1 font-medium">
                  {issue.quantity} {issue.unit}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location & Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">From Location</label>
                <div className="mt-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {issue.fromLocationId || "N/A"}
                </div>
              </div>
              {issue.toLocationId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">To Location</label>
                  <div className="mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {issue.toLocationId}
                  </div>
                </div>
              )}
              {issue.workOrderId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Work Order ID</label>
                  <div className="mt-1">{issue.workOrderId}</div>
                </div>
              )}
              {issue.batchId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch ID</label>
                  <div className="mt-1">{issue.batchId}</div>
                </div>
              )}
              {issue.referenceType && issue.referenceId && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <div className="mt-1">
                    <div className="font-medium">{issue.referenceType}</div>
                    <div className="text-sm text-muted-foreground">#{issue.referenceId}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Requested At
                </label>
                <div className="mt-1">{formatDateISO(issue.requestedAt)}</div>
              </div>
              {issue.approvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Approved At
                  </label>
                  <div className="mt-1">{formatDateISO(issue.approvedAt)}</div>
                </div>
              )}
              {issue.pickedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Picked At
                  </label>
                  <div className="mt-1">{formatDateISO(issue.pickedAt)}</div>
                </div>
              )}
              {issue.issuedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Issued At
                  </label>
                  <div className="mt-1">{formatDateISO(issue.issuedAt)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {issue.remarks && (
            <Card>
              <CardHeader>
                <CardTitle>Remarks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{issue.remarks}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <ConfirmDialog
          open={actionDialogOpen}
          onOpenChange={setActionDialogOpen}
          title={actionType === 'approve' ? "Approve Material Issue" : actionType === 'pick' ? "Pick Material Issue" : "Issue Material"}
          description={actionType === 'approve' ? `Are you sure you want to approve material issue ${issue.issueNumber}?` : actionType === 'pick' ? `Are you sure you want to pick material issue ${issue.issueNumber}?` : `Are you sure you want to issue material ${issue.issueNumber}? This will create a stock movement and update inventory.`}
          confirmText={actionType === 'approve' ? 'Approve' : actionType === 'pick' ? 'Pick' : 'Issue'}
          cancelText="Cancel"
          onConfirm={handleActionConfirm}
          variant="default"
        />
      </div>
    </DashboardLayout>
  )
}

