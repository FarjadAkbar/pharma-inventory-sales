"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Settings
} from 'lucide-react'
import { integrationService, type IntegrationWorkflow, type WorkflowStep } from '@/services/integration.service'

interface WorkflowManagerProps {
  workflowId: string
  onClose: () => void
}

export function WorkflowManager({ workflowId, onClose }: WorkflowManagerProps) {
  const [workflow, setWorkflow] = useState<IntegrationWorkflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [executing, setExecuting] = useState(false)

  useEffect(() => {
    loadWorkflow()
  }, [workflowId])

  const loadWorkflow = async () => {
    try {
      setLoading(true)
      const response = await integrationService.getWorkflow(workflowId)
      if (response.success) {
        setWorkflow(response.data)
      } else {
        setError('Failed to load workflow')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow')
    } finally {
      setLoading(false)
    }
  }

  const executeStep = async (stepId: string) => {
    if (!workflow) return

    try {
      setExecuting(true)
      const response = await integrationService.executeWorkflowStep(workflowId, stepId)
      if (response.success) {
        setWorkflow(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute step')
    } finally {
      setExecuting(false)
    }
  }

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

  if (!workflow) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Workflow not found</AlertDescription>
      </Alert>
    )
  }

  const completedSteps = workflow.steps.filter(step => step.status === 'completed').length
  const totalSteps = workflow.steps.length
  const progressPercentage = (completedSteps / totalSteps) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {workflow.type.replace(/_/g, ' ').toUpperCase()}
          </h1>
          <p className="text-muted-foreground">
            Workflow ID: {workflow.id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadWorkflow}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Status</CardTitle>
            <Badge className={`${getStatusColor(workflow.status)} text-white`}>
              {getStatusIcon(workflow.status)}
              <span className="ml-1">{workflow.status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{completedSteps}/{totalSteps} steps completed</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium">Created</div>
                <div className="text-muted-foreground">
                  {new Date(workflow.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Updated</div>
                <div className="text-muted-foreground">
                  {new Date(workflow.updatedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Priority</div>
                <div className="text-muted-foreground">
                  {workflow.metadata.priority}
                </div>
              </div>
              <div>
                <div className="font-medium">Source ID</div>
                <div className="text-muted-foreground">
                  {workflow.metadata.sourceId}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>
            Monitor and control each step in the workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                onExecute={() => executeStep(step.id)}
                executing={executing}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StepCardProps {
  step: WorkflowStep
  index: number
  onExecute: () => void
  executing: boolean
}

function StepCard({ step, index, onExecute, executing }: StepCardProps) {
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

  const canExecute = step.status === 'pending' && !executing
  const isExecuting = step.status === 'in_progress' && executing

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
            <span className="text-sm font-medium">{index + 1}</span>
          </div>
          <div>
            <h3 className="font-medium">{step.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {step.module}
              </Badge>
              <span>•</span>
              <span>{new Date(step.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge className={`${getStatusColor(step.status)} text-white`}>
            {getStatusIcon(step.status)}
            <span className="ml-1">{step.status}</span>
          </Badge>
          
          {canExecute && (
            <Button
              size="sm"
              onClick={onExecute}
              disabled={executing}
            >
              <Play className="h-4 w-4 mr-1" />
              Execute
            </Button>
          )}
          
          {isExecuting && (
            <Button size="sm" disabled>
              <Clock className="h-4 w-4 mr-1 animate-spin" />
              Executing...
            </Button>
          )}
        </div>
      </div>

      {step.error && (
        <Alert variant="destructive" className="mt-3">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{step.error}</AlertDescription>
        </Alert>
      )}

      {step.data && Object.keys(step.data).length > 0 && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Step Data:</h4>
          <pre className="text-xs text-muted-foreground overflow-x-auto">
            {JSON.stringify(step.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
