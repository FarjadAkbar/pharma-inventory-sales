"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  Plus, 
  Workflow, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Play,
  Eye,
  Settings
} from 'lucide-react'
import { useIntegrationWorkflows } from '@/hooks/use-integration'
import { WorkflowManager } from '@/components/integration/workflow-manager'

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  
  const { workflows, loading, error } = useIntegrationWorkflows({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : typeFilter,
  })

  const filteredWorkflows = workflows.filter(workflow => 
    workflow.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.metadata.sourceId.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search workflows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="procurement_to_supplier">Procurement → Supplier</SelectItem>
                  <SelectItem value="supplier_to_warehouse">Supplier → Warehouse</SelectItem>
                  <SelectItem value="warehouse_to_quality">Warehouse → Quality</SelectItem>
                  <SelectItem value="manufacturing_to_finished">Manufacturing → Finished</SelectItem>
                  <SelectItem value="sales_to_distribution">Sales → Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows
              .filter(w => w.status === 'pending' || w.status === 'in_progress')
              .map((workflow) => {
                const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
                const totalSteps = workflow.steps.length
                const progressPercentage = (completedSteps / totalSteps) * 100

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {workflow.type.replace(/_/g, ' ').toUpperCase()}
                        </CardTitle>
                        <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1">{workflow.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        ID: {workflow.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{completedSteps}/{totalSteps} steps</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Steps:</h4>
                          <div className="space-y-1">
                            {workflow.steps.slice(0, 3).map((step, index) => (
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
                            {workflow.steps.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{workflow.steps.length - 3} more steps
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-muted-foreground">
                            Priority: <Badge variant="outline" className="ml-1">{workflow.metadata.priority}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedWorkflow(workflow.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows
              .filter(w => w.status === 'completed')
              .map((workflow) => {
                const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
                const totalSteps = workflow.steps.length
                const progressPercentage = (completedSteps / totalSteps) * 100

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {workflow.type.replace(/_/g, ' ').toUpperCase()}
                        </CardTitle>
                        <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1">{workflow.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        Completed: {new Date(workflow.updatedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{completedSteps}/{totalSteps} steps</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-muted-foreground">
                            Duration: {Math.round((new Date(workflow.updatedAt).getTime() - new Date(workflow.createdAt).getTime()) / (1000 * 60 * 60))}h
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedWorkflow(workflow.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows
              .filter(w => w.status === 'failed')
              .map((workflow) => {
                const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
                const totalSteps = workflow.steps.length
                const progressPercentage = (completedSteps / totalSteps) * 100

                return (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {workflow.type.replace(/_/g, ' ').toUpperCase()}
                        </CardTitle>
                        <Badge className={`${getStatusColor(workflow.status)} text-white`}>
                          {getStatusIcon(workflow.status)}
                          <span className="ml-1">{workflow.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>
                        Failed: {new Date(workflow.updatedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{completedSteps}/{totalSteps} steps</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <div className="text-xs text-muted-foreground">
                            Error: Check workflow details
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedWorkflow(workflow.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Debug
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

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
