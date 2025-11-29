"use client"

import { useState, useEffect, useCallback } from 'react'
import { integrationService, type IntegrationWorkflow, type ComplianceMetrics, type IntegrationEvent } from '@/services/integration.service'

export function useIntegrationWorkflows(filters?: {
  type?: string
  status?: string
  module?: string
  dateFrom?: string
  dateTo?: string
}) {
  const [workflows, setWorkflows] = useState<IntegrationWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await integrationService.getWorkflows(filters)
      if (response.success) {
        setWorkflows(response.data)
      } else {
        setError('Failed to load workflows')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadWorkflows()
  }, [loadWorkflows])

  const createWorkflow = useCallback(async (workflowData: Omit<IntegrationWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await integrationService.createWorkflow(workflowData)
      if (response.success) {
        setWorkflows(prev => [response.data, ...prev])
        return response.data
      } else {
        throw new Error('Failed to create workflow')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow')
      throw err
    }
  }, [])

  const updateWorkflow = useCallback(async (workflowId: string, stepId: string, stepData: any) => {
    try {
      const response = await integrationService.updateWorkflowStep(workflowId, stepId, stepData)
      if (response.success) {
        setWorkflows(prev => 
          prev.map(w => w.id === workflowId ? response.data : w)
        )
        return response.data
      } else {
        throw new Error('Failed to update workflow')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow')
      throw err
    }
  }, [])

  const executeWorkflowStep = useCallback(async (workflowId: string, stepId: string) => {
    try {
      const response = await integrationService.executeWorkflowStep(workflowId, stepId)
      if (response.success) {
        setWorkflows(prev => 
          prev.map(w => w.id === workflowId ? response.data : w)
        )
        return response.data
      } else {
        throw new Error('Failed to execute workflow step')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow step')
      throw err
    }
  }, [])

  return {
    workflows,
    loading,
    error,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    executeWorkflowStep,
  }
}

export function useComplianceMetrics(period?: string) {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await integrationService.getComplianceMetrics(period)
      if (response.success) {
        setMetrics(response.data)
      } else {
        setError('Failed to load compliance metrics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load compliance metrics')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  return {
    metrics,
    loading,
    error,
    loadMetrics,
  }
}

export function useIntegrationEvents(filters?: {
  type?: string
  module?: string
  workflowId?: string
  dateFrom?: string
  dateTo?: string
}) {
  const [events, setEvents] = useState<IntegrationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await integrationService.getEvents(filters)
      if (response.success) {
        setEvents(response.data)
      } else {
        setError('Failed to load events')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return {
    events,
    loading,
    error,
    loadEvents,
  }
}

export function useWorkflowAnalytics(period?: string) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await integrationService.getWorkflowAnalytics(period)
      if (response.success) {
        setAnalytics(response.data)
      } else {
        setError('Failed to load analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  return {
    analytics,
    loading,
    error,
    loadAnalytics,
  }
}

// Workflow creation helpers
export function useWorkflowCreation() {
  const { createWorkflow } = useIntegrationWorkflows()

  const createProcurementToSupplierWorkflow = useCallback(async (poId: string) => {
    return integrationService.initiateProcurementToSupplierWorkflow(poId)
  }, [])

  const createSupplierToWarehouseWorkflow = useCallback(async (grnId: string, poId: string) => {
    return integrationService.initiateSupplierToWarehouseWorkflow(grnId, poId)
  }, [])

  const createWarehouseToQualityWorkflow = useCallback(async (sampleId: string, grnId: string) => {
    return integrationService.initiateWarehouseToQualityWorkflow(sampleId, grnId)
  }, [])

  const createManufacturingToFinishedWorkflow = useCallback(async (batchId: string, workOrderId: string) => {
    return integrationService.initiateManufacturingToFinishedWorkflow(batchId, workOrderId)
  }, [])

  const createSalesToDistributionWorkflow = useCallback(async (salesOrderId: string) => {
    return integrationService.initiateSalesToDistributionWorkflow(salesOrderId)
  }, [])

  return {
    createProcurementToSupplierWorkflow,
    createSupplierToWarehouseWorkflow,
    createWarehouseToQualityWorkflow,
    createManufacturingToFinishedWorkflow,
    createSalesToDistributionWorkflow,
  }
}
