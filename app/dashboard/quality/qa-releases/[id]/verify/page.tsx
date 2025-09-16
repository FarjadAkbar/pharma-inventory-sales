"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Save, 
  CheckCircle,
  XCircle,
  AlertCircle,
  TestTube,
  Beaker,
  Microscope,
  Activity,
  Target,
  FileText,
  User,
  Calendar,
  Package,
  Shield,
  CheckSquare,
  AlertTriangle,
  Clock,
  Pause
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { QARelease, QADecision } from "@/types/quality-assurance"
import { formatDateISO } from "@/lib/utils"

interface VerificationPageProps {
  params: {
    id: string
  }
}

export default function QAVerificationPage({ params }: VerificationPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const [release, setRelease] = useState<QARelease | null>(null)
  const [decision, setDecision] = useState<QADecision>("Pending")
  const [decisionReason, setDecisionReason] = useState("")
  const [eSignature, setESignature] = useState("")
  const [remarks, setRemarks] = useState("")
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({})
  const [checklistRemarks, setChecklistRemarks] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchReleaseData()
  }, [params.id])

  const fetchReleaseData = async () => {
    try {
      const response = await apiService.getQARelease(params.id)
      if (response.success && response.data) {
        setRelease(response.data)
        setDecision(response.data.decision)
        setDecisionReason(response.data.decisionReason || "")
        setRemarks(response.data.remarks || "")
        
        // Initialize checklist items
        const initialChecklist: Record<string, boolean> = {}
        const initialRemarks: Record<string, string> = {}
        response.data.checklistItems.forEach(item => {
          initialChecklist[item.id] = item.checked
          initialRemarks[item.id] = item.remarks || ""
        })
        setChecklistItems(initialChecklist)
        setChecklistRemarks(initialRemarks)
      }
    } catch (error) {
      console.error("Failed to fetch release:", error)
    }
  }

  const handleChecklistChange = (itemId: string, checked: boolean) => {
    setChecklistItems(prev => ({
      ...prev,
      [itemId]: checked
    }))
  }

  const handleChecklistRemarksChange = (itemId: string, remarks: string) => {
    setChecklistRemarks(prev => ({
      ...prev,
      [itemId]: remarks
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!release) return

    // Validate required fields
    if (decision === "Pending") {
      setErrors({ decision: "Please select a decision" })
      return
    }

    if ((decision === "Reject" || decision === "Hold") && !decisionReason.trim()) {
      setErrors({ decisionReason: "Reason is required for reject or hold decisions" })
      return
    }

    // Check if all required checklist items are completed
    const requiredItems = release.checklistItems.filter(item => item.isRequired)
    const incompleteRequired = requiredItems.filter(item => !checklistItems[item.id])
    
    if (incompleteRequired.length > 0) {
      setErrors({ checklist: "All required checklist items must be completed" })
      return
    }

    setSaving(true)
    try {
      const updatedRelease = {
        ...release,
        decision,
        decisionReason: decisionReason.trim() || undefined,
        remarks: remarks.trim() || undefined,
        status: decision === "Release" ? "Approved" : decision === "Reject" ? "Rejected" : "On Hold",
        checklistItems: release.checklistItems.map(item => ({
          ...item,
          checked: checklistItems[item.id],
          remarks: checklistRemarks[item.id] || undefined,
          checkedBy: checklistItems[item.id] ? "7" : undefined,
          checkedByName: checklistItems[item.id] ? "Dr. Sarah Ahmed" : undefined,
          checkedAt: checklistItems[item.id] ? new Date().toISOString() : undefined
        })),
        reviewedBy: "7",
        reviewedByName: "Dr. Sarah Ahmed",
        reviewedAt: new Date().toISOString(),
        eSignature: eSignature.trim() || `sarah_ahmed_${Date.now()}`,
        completedAt: new Date().toISOString()
      }

      await apiService.updateQARelease(updatedRelease)

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/quality/qa-releases")
      }, 2000)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save verification" })
    } finally {
      setSaving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case "Under Review":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>
      case "Pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case "On Hold":
        return <Badge className="bg-orange-100 text-orange-800"><Pause className="h-3 w-3 mr-1" />On Hold</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Urgent</Badge>
      case "High":
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />High</Badge>
      case "Normal":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />Normal</Badge>
      case "Low":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Low</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Normal</Badge>
    }
  }

  const getTestIcon = (testName: string) => {
    if (testName.includes("Assay")) return <Target className="h-4 w-4" />
    if (testName.includes("Dissolution")) return <Activity className="h-4 w-4" />
    if (testName.includes("Identification")) return <Eye className="h-4 w-4" />
    if (testName.includes("Microbial")) return <Microscope className="h-4 w-4" />
    return <TestTube className="h-4 w-4" />
  }

  const getPassFailBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Pass
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Fail
      </Badge>
    )
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Complete!</h2>
                <p className="text-muted-foreground mb-4">
                  The QA verification has been completed and submitted successfully.
                </p>
                <Button onClick={() => router.push("/dashboard/quality/qa-releases")} className="bg-orange-600 hover:bg-orange-700">
                  Back to Releases
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!release) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Release Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested release could not be found.</p>
            <Button onClick={() => router.push("/dashboard/quality/qa-releases")} className="bg-orange-600 hover:bg-orange-700">
              Back to Releases
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QA Verification</h1>
            <p className="text-muted-foreground">Verify and approve release {release.releaseNumber}</p>
          </div>
        </div>

        {/* Release Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Release Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium">Release Number</Label>
                <div className="text-sm font-mono text-orange-600">{release.releaseNumber}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Material</Label>
                <div className="text-sm">{release.materialName} ({release.materialCode})</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Batch Number</Label>
                <div className="text-sm">{release.batchNumber}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="text-sm">{release.quantity} {release.unit}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <div className="text-sm">{release.sourceType} - {release.sourceReference}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div>{getPriorityBadge(release.priority)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div>{getStatusBadge(release.status)}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <div className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {release.dueDate ? formatDateISO(release.dueDate) : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* QC Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                QC Results Summary
              </CardTitle>
              <CardDescription>Review all QC test results and compliance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {release.qcResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTestIcon(result.testName)}
                      <h3 className="font-medium">{result.testName}</h3>
                      <Badge variant="outline">{result.testCode}</Badge>
                    </div>
                    {getPassFailBadge(result.passed)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs font-medium">Parameter</Label>
                      <div>{result.parameter}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Result</Label>
                      <div className="font-mono">{result.resultValue} {result.unit}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Specification</Label>
                      <div>{result.specification}</div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Deviation</Label>
                      <div className={result.deviation && result.deviation !== 0 ? "text-orange-600" : ""}>
                        {result.deviation ? `${result.deviation > 0 ? '+' : ''}${result.deviation} ${result.unit}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  {result.testedByName && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Tested by {result.testedByName} on {formatDateISO(result.testedAt)}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* QA Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                QA Verification Checklist
              </CardTitle>
              <CardDescription>Complete all required checklist items for verification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {release.checklistItems.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={item.id}
                      checked={checklistItems[item.id] || false}
                      onCheckedChange={(checked) => handleChecklistChange(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={item.id} className="font-medium">
                          {item.item}
                        </Label>
                        {item.isRequired && (
                          <Badge className="bg-red-100 text-red-800 text-xs">Required</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <Textarea
                        placeholder="Enter remarks or observations..."
                        value={checklistRemarks[item.id] || ""}
                        onChange={(e) => handleChecklistRemarksChange(item.id, e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {errors.checklist && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.checklist}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Decision Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                QA Decision
              </CardTitle>
              <CardDescription>Make the final QA decision based on review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Decision *</Label>
                <Select value={decision} onValueChange={(value: QADecision) => setDecision(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select decision" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Release">Release</SelectItem>
                    <SelectItem value="Reject">Reject</SelectItem>
                    <SelectItem value="Hold">Hold</SelectItem>
                  </SelectContent>
                </Select>
                {errors.decision && (
                  <p className="text-sm text-red-600">{errors.decision}</p>
                )}
              </div>

              {(decision === "Reject" || decision === "Hold") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reason *</Label>
                  <Textarea
                    placeholder="Enter reason for rejection or hold..."
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    rows={3}
                  />
                  {errors.decisionReason && (
                    <p className="text-sm text-red-600">{errors.decisionReason}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Electronic Signature</Label>
                <Input
                  placeholder="Enter your electronic signature"
                  value={eSignature}
                  onChange={(e) => setESignature(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Remarks</Label>
                <Textarea
                  placeholder="Enter any additional remarks or observations..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-orange-600 hover:bg-orange-700">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Submit Verification
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
