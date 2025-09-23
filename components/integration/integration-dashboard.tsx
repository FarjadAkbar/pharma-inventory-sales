"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UnifiedDataTable } from '@/components/ui/unified-data-table'
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Workflow,
  Zap,
  Shield,
  Target,
  Eye,
  Settings,
  Play
} from 'lucide-react'
import { integrationService, type IntegrationWorkflow, type ComplianceMetrics } from '@/services/integration.service'

interface WorkflowCardProps {
  workflow: IntegrationWorkflow
  onViewDetails: (workflowId: string) => void
}

function WorkflowCard({ workflow, onViewDetails }: WorkflowCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'in_progress': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
  const totalSteps = workflow.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workflow.type.replace(/_/g, ' ').toUpperCase()}</CardTitle>
          <Badge className={`${getStatusColor(workflow.status)} text-white`}>
            {getStatusIcon(workflow.status)}
            <span className="ml-1">{workflow.status}</span>
          </Badge>
        </div>
        <CardDescription>
          Created: {new Date(workflow.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{completedSteps}/{totalSteps} steps</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Steps:</h4>
            <div className="space-y-1">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-between text-xs">
                  <span className="flex items-center">
                    {getStatusIcon(step.status)}
                    <span className="ml-2">{step.name}</span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {step.module}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-muted-foreground">
              Priority: <Badge variant="outline" className="ml-1">{workflow.metadata.priority}</Badge>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails(workflow.id)}
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ComplianceCardProps {
  metrics: ComplianceMetrics
}

function ComplianceCard({ metrics }: ComplianceCardProps) {
  const metricsData = [
    {
      label: 'On-Time In-Full (OTIF)',
      value: metrics.otif,
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Quality Score',
      value: metrics.qualityScore,
      icon: <Shield className="h-4 w-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Traceability Score',
      value: metrics.traceabilityScore,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Regulatory Compliance',
      value: metrics.regulatoryCompliance,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      label: 'Efficiency Score',
      value: metrics.efficiencyScore,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {metricsData.map((metric, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <div className={metric.color}>
                  {metric.icon}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric.label}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function IntegrationDashboard() {
  const [workflows, setWorkflows] = useState<IntegrationWorkflow[]>([])
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<IntegrationWorkflow | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [workflowsResponse, metricsResponse] = await Promise.all([
        integrationService.getActiveWorkflows(),
        integrationService.getComplianceMetrics()
      ])

      if (workflowsResponse.success) {
        setWorkflows(workflowsResponse.data)
      }

      if (metricsResponse.success) {
        setComplianceMetrics(metricsResponse.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewWorkflowDetails = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId)
    if (workflow) {
      setSelectedWorkflow(workflow)
    }
  }

  const handleCreateWorkflow = async (type: IntegrationWorkflow['type']) => {
    try {
      let response
      switch (type) {
        case 'procurement_to_supplier':
          response = await integrationService.initiateProcurementToSupplierWorkflow('po_123')
          break
        case 'supplier_to_warehouse':
          response = await integrationService.initiateSupplierToWarehouseWorkflow('grn_123', 'po_123')
          break
        case 'warehouse_to_quality':
          response = await integrationService.initiateWarehouseToQualityWorkflow('sample_123', 'grn_123')
          break
        case 'manufacturing_to_finished':
          response = await integrationService.initiateManufacturingToFinishedWorkflow('batch_123', 'wo_123')
          break
        case 'sales_to_distribution':
          response = await integrationService.initiateSalesToDistributionWorkflow('so_123')
          break
        default:
          throw new Error('Unknown workflow type')
      }

      if (response.success) {
        setWorkflows(prev => [response.data, ...prev])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor end-to-end pharmaceutical supply chain workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadDashboardData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Compliance Metrics */}
      {complianceMetrics && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compliance Metrics</h2>
          <ComplianceCard metrics={complianceMetrics} />
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Active Workflows</TabsTrigger>
          <TabsTrigger value="create">Create Workflow</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Workflows</h2>
            <Badge variant="outline">
              {workflows.length} active
            </Badge>
          </div>

          <UnifiedDataTable
            data={workflows}
            columns={[
              {
                key: 'type',
                header: 'Workflow Type',
                render: (workflow) => (
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {workflow.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                ),
                sortable: true,
              },
              {
                key: 'status',
                header: 'Status',
                render: (workflow) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'completed': return 'bg-green-500'
                      case 'failed': return 'bg-red-500'
                      case 'in_progress': return 'bg-blue-500'
                      default: return 'bg-gray-500'
                    }
                  }
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case 'completed': return <CheckCircle className="h-4 w-4" />
                      case 'failed': return <XCircle className="h-4 w-4" />
                      case 'in_progress': return <Clock className="h-4 w-4" />
                      default: return <AlertTriangle className="h-4 w-4" />
                    }
                  }
                  return (
                    <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                      {getStatusIcon(workflow.status)}
                      <span className="ml-1">{workflow.status}</span>
                    </Badge>
                  )
                },
                sortable: true,
              },
              {
                key: 'progress',
                header: 'Progress',
                render: (workflow) => {
                  const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
                  const totalSteps = workflow.steps.length
                  const progressPercentage = (completedSteps / totalSteps) * 100
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{completedSteps}/{totalSteps} steps</span>
                        <span>{progressPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )
                },
              },
              {
                key: 'priority',
                header: 'Priority',
                render: (workflow) => (
                  <Badge variant="outline">{workflow.metadata.priority}</Badge>
                ),
                sortable: true,
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (workflow) => (
                  <span className="text-sm text-muted-foreground">
                    {new Date(workflow.createdAt).toLocaleDateString()}
                  </span>
                ),
                sortable: true,
              },
            ]}
            filters={[
              {
                key: 'status',
                label: 'Status',
                type: 'select',
                options: [
                  { value: 'pending', label: 'Pending' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                ],
              },
              {
                key: 'type',
                label: 'Workflow Type',
                type: 'select',
                options: [
                  { value: 'procurement_to_supplier', label: 'Procurement → Supplier' },
                  { value: 'supplier_to_warehouse', label: 'Supplier → Warehouse' },
                  { value: 'warehouse_to_quality', label: 'Warehouse → Quality' },
                  { value: 'manufacturing_to_finished', label: 'Manufacturing → Finished' },
                  { value: 'sales_to_distribution', label: 'Sales → Distribution' },
                ],
              },
              {
                key: 'priority',
                label: 'Priority',
                type: 'select',
                options: [
                  { value: 'low', label: 'Low' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ],
              },
            ]}
            actions={(workflow) => (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewWorkflowDetails(workflow.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </>
            )}
            bulkActions={[
              {
                label: 'Execute Selected',
                action: (selectedWorkflows) => {
                  console.log('Executing workflows:', selectedWorkflows)
                },
                icon: Play,
              },
            ]}
            onRefresh={loadDashboardData}
            onExport={() => console.log('Export workflows')}
            searchPlaceholder="Search workflows..."
            emptyMessage="No active workflows found. Create a new workflow to start monitoring the supply chain integration."
            showBulkActions={true}
            showRefresh={true}
            showExport={true}
          />
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <h2 className="text-xl font-semibold">Create New Workflow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                type: 'procurement_to_supplier' as const,
                title: 'Procurement → Supplier',
                description: 'Create and approve purchase orders, notify suppliers',
                icon: <Activity className="h-6 w-6" />
              },
              {
                type: 'supplier_to_warehouse' as const,
                title: 'Supplier → Warehouse',
                description: 'Receive goods, perform quality sampling',
                icon: <BarChart3 className="h-6 w-6" />
              },
              {
                type: 'warehouse_to_quality' as const,
                title: 'Warehouse → Quality',
                description: 'QC testing and QA review process',
                icon: <Shield className="h-6 w-6" />
              },
              {
                type: 'manufacturing_to_finished' as const,
                title: 'Manufacturing → Finished',
                description: 'Produce finished goods with quality control',
                icon: <Zap className="h-6 w-6" />
              },
              {
                type: 'sales_to_distribution' as const,
                title: 'Sales → Distribution',
                description: 'Process orders and manage deliveries',
                icon: <Target className="h-6 w-6" />
              }
            ].map((workflow) => (
              <Card key={workflow.type} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCreateWorkflow(workflow.type)}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    {workflow.icon}
                    <CardTitle className="text-lg">{workflow.title}</CardTitle>
                  </div>
                  <CardDescription>{workflow.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Create Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-xl font-semibold">Workflow Analytics</h2>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed workflow analytics and performance metrics will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Details</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedWorkflow(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkflow.type.replace(/_/g, ' ').toUpperCase()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkflow.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedWorkflow.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkflow.metadata.priority}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Steps</label>
                <div className="space-y-2">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{step.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {step.module}
                        </Badge>
                      </div>
                      <Badge 
                        className={`${
                          step.status === 'completed' ? 'bg-green-500' :
                          step.status === 'failed' ? 'bg-red-500' :
                          step.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-500'
                        } text-white`}
                      >
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
