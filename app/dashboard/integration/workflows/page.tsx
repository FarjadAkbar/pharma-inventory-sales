"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UnifiedDataTable } from '@/components/ui/unified-data-table'
import { 
  Plus, 
  Workflow, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Play,
  Eye,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react'
import { useIntegrationWorkflows } from '@/hooks/use-integration'
import { WorkflowManager } from '@/components/integration/workflow-manager'

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  
  const { workflows, loading, error, loadWorkflows } = useIntegrationWorkflows()

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

  const getFilteredWorkflows = () => {
    switch (activeTab) {
      case 'active':
        return workflows.filter(w => w.status === 'pending' || w.status === 'in_progress')
      case 'completed':
        return workflows.filter(w => w.status === 'completed')
      case 'failed':
        return workflows.filter(w => w.status === 'failed')
      default:
        return workflows
    }
  }

  if (selectedWorkflow) {
    return (
      <WorkflowManager 
        workflowId={selectedWorkflow} 
        onClose={() => setSelectedWorkflow(null)} 
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage end-to-end pharmaceutical supply chain workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Workflows Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Workflows</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <UnifiedDataTable
            data={getFilteredWorkflows()}
            columns={[
              {
                key: 'id',
                header: 'Workflow ID',
                render: (workflow) => (
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{workflow.id}</span>
                  </div>
                ),
                sortable: true,
              },
              {
                key: 'type',
                header: 'Type',
                render: (workflow) => (
                  <span className="font-medium">
                    {workflow.type.replace(/_/g, ' ').toUpperCase()}
                  </span>
                ),
                sortable: true,
              },
              {
                key: 'status',
                header: 'Status',
                render: (workflow) => (
                  <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                    {getStatusIcon(workflow.status)}
                    <span className="ml-1">{workflow.status}</span>
                  </Badge>
                ),
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
                        <span>{completedSteps}/{totalSteps}</span>
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
                key: 'sourceId',
                header: 'Source ID',
                render: (workflow) => (
                  <span className="font-mono text-sm">{workflow.metadata.sourceId}</span>
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
              {
                key: 'updatedAt',
                header: 'Updated',
                render: (workflow) => (
                  <span className="text-sm text-muted-foreground">
                    {new Date(workflow.updatedAt).toLocaleDateString()}
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
              {
                key: 'sourceId',
                label: 'Source ID',
                type: 'text',
                placeholder: 'Filter by source ID',
              },
            ]}
            actions={(workflow) => (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedWorkflow(workflow.id)}
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
              {
                label: 'Export Selected',
                action: (selectedWorkflows) => {
                  console.log('Exporting workflows:', selectedWorkflows)
                },
                icon: Download,
              },
            ]}
            onRefresh={loadWorkflows}
            onExport={() => console.log('Export all workflows')}
            searchPlaceholder="Search workflows by ID, type, or source..."
            emptyMessage="No workflows found. Create a new workflow to start monitoring the supply chain integration."
            showBulkActions={true}
            showRefresh={true}
            showExport={true}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Workflows</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
