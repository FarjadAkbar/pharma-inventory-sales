"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
  Package
} from "lucide-react"
import { apiService } from "@/services/api.service"
import type { QCSample, QCTestResult, QCTest } from "@/types/quality-control"
import { formatDateISO } from "@/lib/utils"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default function SampleResultsPage({ params }: ResultsPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)

  const [sample, setSample] = useState<QCSample | null>(null)
  const [testResults, setTestResults] = useState<QCTestResult[]>([])
  const [tests, setTests] = useState<QCTest[]>([])

  useEffect(() => {
    fetchSampleData()
    fetchTests()
  }, [params.id])

  const fetchSampleData = async () => {
    try {
      const response = await apiService.getQCSample(params.id)
      if (response.success && response.data) {
        setSample(response.data)
        setTestResults(response.data.testResults || [])
      }
    } catch (error) {
      console.error("Failed to fetch sample:", error)
    }
  }

  const fetchTests = async () => {
    try {
      const response = await apiService.getQCTests()
      if (response.success && response.data) {
        setTests(response.data.qcTests || [])
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error)
    }
  }

  const handleResultChange = (testId: string, field: string, value: string | number | boolean) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.testId === testId)
      if (existing) {
        return prev.map(r => 
          r.testId === testId 
            ? { ...r, [field]: value }
            : r
        )
      } else {
        const test = tests.find(t => t.id === testId)
        const specification = test?.specifications[0]
        return [...prev, {
          id: Date.now().toString(),
          testId,
          sampleId: params.id,
          sampleTestId: testId,
          parameter: specification?.parameter || "",
          resultValue: field === "resultValue" ? value.toString() : "",
          unit: specification?.unit || "",
          specification: specification || {
            id: "",
            parameter: "",
            criteria: "",
            isRequired: true
          },
          passed: false,
          remarks: "",
          testedBy: "4", // Current user ID
          testedByName: "Dr. Fatima Khan", // Current user name
          testedAt: new Date().toISOString()
        }]
      }
    })
  }

  const calculatePassFail = (result: QCTestResult) => {
    const { specification, resultValue } = result
    const value = parseFloat(resultValue)
    
    if (isNaN(value)) return false
    
    let passed = true
    
    if (specification.minValue !== undefined && value < specification.minValue) {
      passed = false
    }
    
    if (specification.maxValue !== undefined && value > specification.maxValue) {
      passed = false
    }
    
    return passed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sample) return

    setSaving(true)
    try {
      // Update test results with pass/fail calculations
      const updatedResults = testResults.map(result => ({
        ...result,
        passed: calculatePassFail(result),
        deviation: result.specification.targetValue 
          ? parseFloat(result.resultValue) - result.specification.targetValue
          : undefined
      }))

      await apiService.updateQCSampleResults(params.id, {
        testResults: updatedResults,
        status: "Completed",
        completedAt: new Date().toISOString()
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/quality/samples")
      }, 2000)
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "Failed to save results" })
    } finally {
      setSaving(false)
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
                <h2 className="text-2xl font-bold text-green-600 mb-2">Results Saved Successfully!</h2>
                <p className="text-muted-foreground mb-4">
                  The QC test results have been saved and submitted for review.
                </p>
                <Button onClick={() => router.push("/dashboard/quality/samples")} className="bg-orange-600 hover:bg-orange-700">
                  Back to Samples
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (!sample) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sample Not Found</h2>
            <p className="text-muted-foreground mb-4">The requested sample could not be found.</p>
            <Button onClick={() => router.push("/dashboard/quality/samples")} className="bg-orange-600 hover:bg-orange-700">
              Back to Samples
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
            <h1 className="text-3xl font-bold tracking-tight">QC Test Results Entry</h1>
            <p className="text-muted-foreground">Enter test results for sample {sample.sampleCode}</p>
          </div>
        </div>

        {/* Sample Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Sample Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Sample Code</Label>
                <div className="text-sm font-mono text-orange-600">{sample.sampleCode}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Material</Label>
                <div className="text-sm">{sample.materialName} ({sample.materialCode})</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Batch Number</Label>
                <div className="text-sm">{sample.batchNumber}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <div className="text-sm">{sample.sourceType} - {sample.sourceReference}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="text-sm">{sample.quantity} {sample.unit}</div>
              </div>
              <div>
                <Label className="text-sm font-medium">Due Date</Label>
                <div className="text-sm flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {sample.dueDate ? formatDateISO(sample.dueDate) : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test Results Entry
              </CardTitle>
              <CardDescription>Enter test results for each assigned test method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {sample.tests.map((test) => {
                const result = testResults.find(r => r.testId === test.testId)
                const testMethod = tests.find(t => t.id === test.testId)
                const passed = result ? calculatePassFail(result) : false

                return (
                  <div key={test.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTestIcon(test.testName)}
                        <h3 className="font-medium">{test.testName}</h3>
                        <Badge variant="outline">{test.testCode}</Badge>
                      </div>
                      {result && getPassFailBadge(passed)}
                    </div>

                    {testMethod?.specifications.map((spec, index) => (
                      <div key={spec.id} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Parameter</Label>
                          <div className="text-sm">{spec.parameter}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Result Value *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={result?.resultValue || ""}
                            onChange={(e) => handleResultChange(test.testId, "resultValue", e.target.value)}
                            placeholder="Enter result"
                            className={passed === false && result ? "border-red-500" : ""}
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Unit</Label>
                          <div className="text-sm">{spec.unit}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Specification</Label>
                          <div className="text-sm text-muted-foreground">
                            {spec.minValue !== undefined && spec.maxValue !== undefined
                              ? `${spec.minValue}-${spec.maxValue} ${spec.unit}`
                              : spec.minValue !== undefined
                              ? `≥ ${spec.minValue} ${spec.unit}`
                              : spec.maxValue !== undefined
                              ? `≤ ${spec.maxValue} ${spec.unit}`
                              : spec.criteria
                            }
                          </div>
                        </div>
                      </div>
                    ))}

                    <div>
                      <Label className="text-sm font-medium">Remarks</Label>
                      <Textarea
                        value={result?.remarks || ""}
                        onChange={(e) => handleResultChange(test.testId, "remarks", e.target.value)}
                        placeholder="Enter any remarks or observations..."
                        rows={2}
                      />
                    </div>

                    {passed === false && result && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Result is out of specification. Please review and verify the result.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )
              })}
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
                  Save Results
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
