"use client"

import { apiService } from "./api.service"
import { BASE_URL } from "@/config"
import type { ApiResponse } from "@/types/auth"

// Integration workflow types
export interface WorkflowStep {
  id: string
  name: string
  module: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  data: any
  timestamp: Date
  error?: string
}

export interface IntegrationWorkflow {
  id: string
  type: 'procurement_to_supplier' | 'supplier_to_warehouse' | 'warehouse_to_quality' | 'manufacturing_to_finished' | 'sales_to_distribution'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
  metadata: {
    sourceId: string
    targetId?: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    assignedTo?: string
  }
}

export interface ComplianceMetrics {
  otif: number // On-Time In-Full delivery percentage
  qualityScore: number // Quality compliance score
  traceabilityScore: number // Complete traceability percentage
  regulatoryCompliance: number // Regulatory compliance score
  efficiencyScore: number // Overall process efficiency
}

export interface IntegrationEvent {
  id: string
  type: string
  module: string
  action: string
  data: any
  timestamp: Date
  userId: string
  workflowId?: string
}

class IntegrationService {
  private baseUrl = `${BASE_URL}/integration`
  private workflows: Map<string, IntegrationWorkflow> = new Map()
  private events: IntegrationEvent[] = []

  // Generic request method
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem("auth_token")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Integration request failed")
      }

      return data
    } catch (error) {
      console.error("Integration request failed:", error)
      throw error
    }
  }

  // Workflow Management
  async createWorkflow(workflowData: Omit<IntegrationWorkflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow: IntegrationWorkflow = {
      ...workflowData,
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.workflows.set(workflow.id, workflow)
    this.logEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'workflow_created',
      module: 'integration',
      action: 'create_workflow',
      data: workflow,
      timestamp: new Date(),
      userId: 'system',
      workflowId: workflow.id,
    })

    return {
      success: true,
      data: workflow,
      message: "Workflow created successfully"
    }
  }

  async updateWorkflowStep(workflowId: string, stepId: string, stepData: Partial<WorkflowStep>): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error("Workflow not found")
    }

    const stepIndex = workflow.steps.findIndex(step => step.id === stepId)
    if (stepIndex === -1) {
      throw new Error("Step not found")
    }

    workflow.steps[stepIndex] = { ...workflow.steps[stepIndex], ...stepData }
    workflow.updatedAt = new Date()

    // Update workflow status based on step statuses
    const allCompleted = workflow.steps.every(step => step.status === 'completed')
    const anyFailed = workflow.steps.some(step => step.status === 'failed')
    const anyInProgress = workflow.steps.some(step => step.status === 'in_progress')

    if (anyFailed) {
      workflow.status = 'failed'
    } else if (allCompleted) {
      workflow.status = 'completed'
    } else if (anyInProgress) {
      workflow.status = 'in_progress'
    }

    this.workflows.set(workflowId, workflow)

    this.logEvent({
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'workflow_step_updated',
      module: 'integration',
      action: 'update_step',
      data: { workflowId, stepId, stepData },
      timestamp: new Date(),
      userId: 'system',
      workflowId,
    })

    return {
      success: true,
      data: workflow,
      message: "Workflow step updated successfully"
    }
  }

  async getWorkflow(workflowId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error("Workflow not found")
    }

    return {
      success: true,
      data: workflow,
      message: "Workflow retrieved successfully"
    }
  }

  async getWorkflows(filters?: {
    type?: string
    status?: string
    module?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<IntegrationWorkflow[]>> {
    let workflows = Array.from(this.workflows.values())

    if (filters) {
      if (filters.type) {
        workflows = workflows.filter(w => w.type === filters.type)
      }
      if (filters.status) {
        workflows = workflows.filter(w => w.status === filters.status)
      }
      if (filters.module) {
        workflows = workflows.filter(w => w.steps.some(s => s.module === filters.module))
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        workflows = workflows.filter(w => w.createdAt >= fromDate)
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        workflows = workflows.filter(w => w.createdAt <= toDate)
      }
    }

    return {
      success: true,
      data: workflows,
      message: "Workflows retrieved successfully"
    }
  }

  // Event Logging
  private logEvent(event: IntegrationEvent): void {
    this.events.push(event)
    // In a real implementation, this would be sent to a logging service
    console.log("Integration Event:", event)
  }

  async getEvents(filters?: {
    type?: string
    module?: string
    workflowId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<IntegrationEvent[]>> {
    let events = [...this.events]

    if (filters) {
      if (filters.type) {
        events = events.filter(e => e.type === filters.type)
      }
      if (filters.module) {
        events = events.filter(e => e.module === filters.module)
      }
      if (filters.workflowId) {
        events = events.filter(e => e.workflowId === filters.workflowId)
      }
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        events = events.filter(e => e.timestamp >= fromDate)
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        events = events.filter(e => e.timestamp <= toDate)
      }
    }

    return {
      success: true,
      data: events,
      message: "Events retrieved successfully"
    }
  }

  // Compliance Metrics
  async getComplianceMetrics(period?: string): Promise<ApiResponse<ComplianceMetrics>> {
    // In a real implementation, this would calculate metrics from actual data
    const metrics: ComplianceMetrics = {
      otif: 95.5,
      qualityScore: 98.2,
      traceabilityScore: 99.1,
      regulatoryCompliance: 97.8,
      efficiencyScore: 94.3,
    }

    return {
      success: true,
      data: metrics,
      message: "Compliance metrics retrieved successfully"
    }
  }

  // Integration Workflows Implementation

  // 1. Procurement → Supplier Integration
  async initiateProcurementToSupplierWorkflow(poId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = await this.createWorkflow({
      type: 'procurement_to_supplier',
      status: 'pending',
      steps: [
        {
          id: 'po_approval',
          name: 'Purchase Order Approval',
          module: 'procurement',
          status: 'pending',
          data: { poId },
          timestamp: new Date(),
        },
        {
          id: 'supplier_notification',
          name: 'Supplier Notification',
          module: 'procurement',
          status: 'pending',
          data: { poId },
          timestamp: new Date(),
        },
        {
          id: 'supplier_acknowledgment',
          name: 'Supplier Acknowledgment',
          module: 'procurement',
          status: 'pending',
          data: { poId },
          timestamp: new Date(),
        },
      ],
      metadata: {
        sourceId: poId,
        priority: 'normal',
      },
    })

    // Start the workflow
    await this.executeWorkflowStep(workflow.data.id, 'po_approval')
    return workflow
  }

  // 2. Supplier → Warehouse Integration
  async initiateSupplierToWarehouseWorkflow(grnId: string, poId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = await this.createWorkflow({
      type: 'supplier_to_warehouse',
      status: 'pending',
      steps: [
        {
          id: 'delivery_receipt',
          name: 'Delivery Receipt',
          module: 'warehouse',
          status: 'pending',
          data: { grnId, poId },
          timestamp: new Date(),
        },
        {
          id: 'quality_sampling',
          name: 'Quality Sampling',
          module: 'warehouse',
          status: 'pending',
          data: { grnId },
          timestamp: new Date(),
        },
        {
          id: 'putaway_assignment',
          name: 'Putaway Assignment',
          module: 'warehouse',
          status: 'pending',
          data: { grnId },
          timestamp: new Date(),
        },
      ],
      metadata: {
        sourceId: grnId,
        targetId: poId,
        priority: 'normal',
      },
    })

    await this.executeWorkflowStep(workflow.data.id, 'delivery_receipt')
    return workflow
  }

  // 3. Warehouse → Quality Control Integration
  async initiateWarehouseToQualityWorkflow(sampleId: string, grnId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = await this.createWorkflow({
      type: 'warehouse_to_quality',
      status: 'pending',
      steps: [
        {
          id: 'sample_preparation',
          name: 'Sample Preparation',
          module: 'warehouse',
          status: 'pending',
          data: { sampleId, grnId },
          timestamp: new Date(),
        },
        {
          id: 'qc_testing',
          name: 'QC Testing',
          module: 'quality_control',
          status: 'pending',
          data: { sampleId },
          timestamp: new Date(),
        },
        {
          id: 'qa_review',
          name: 'QA Review',
          module: 'quality_assurance',
          status: 'pending',
          data: { sampleId },
          timestamp: new Date(),
        },
        {
          id: 'release_decision',
          name: 'Release Decision',
          module: 'quality_assurance',
          status: 'pending',
          data: { sampleId },
          timestamp: new Date(),
        },
      ],
      metadata: {
        sourceId: sampleId,
        targetId: grnId,
        priority: 'high',
      },
    })

    await this.executeWorkflowStep(workflow.data.id, 'sample_preparation')
    return workflow
  }

  // 4. Manufacturing → Finished Goods Integration
  async initiateManufacturingToFinishedWorkflow(batchId: string, workOrderId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = await this.createWorkflow({
      type: 'manufacturing_to_finished',
      status: 'pending',
      steps: [
        {
          id: 'material_consumption',
          name: 'Material Consumption',
          module: 'manufacturing',
          status: 'pending',
          data: { batchId, workOrderId },
          timestamp: new Date(),
        },
        {
          id: 'production_execution',
          name: 'Production Execution',
          module: 'manufacturing',
          status: 'pending',
          data: { batchId },
          timestamp: new Date(),
        },
        {
          id: 'finished_goods_qc',
          name: 'Finished Goods QC',
          module: 'quality_control',
          status: 'pending',
          data: { batchId },
          timestamp: new Date(),
        },
        {
          id: 'finished_goods_qa',
          name: 'Finished Goods QA',
          module: 'quality_assurance',
          status: 'pending',
          data: { batchId },
          timestamp: new Date(),
        },
        {
          id: 'inventory_creation',
          name: 'Inventory Creation',
          module: 'warehouse',
          status: 'pending',
          data: { batchId },
          timestamp: new Date(),
        },
      ],
      metadata: {
        sourceId: batchId,
        targetId: workOrderId,
        priority: 'normal',
      },
    })

    await this.executeWorkflowStep(workflow.data.id, 'material_consumption')
    return workflow
  }

  // 5. Sales → Distribution Integration
  async initiateSalesToDistributionWorkflow(salesOrderId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = await this.createWorkflow({
      type: 'sales_to_distribution',
      status: 'pending',
      steps: [
        {
          id: 'order_validation',
          name: 'Order Validation',
          module: 'distribution',
          status: 'pending',
          data: { salesOrderId },
          timestamp: new Date(),
        },
        {
          id: 'inventory_allocation',
          name: 'Inventory Allocation',
          module: 'warehouse',
          status: 'pending',
          data: { salesOrderId },
          timestamp: new Date(),
        },
        {
          id: 'shipment_creation',
          name: 'Shipment Creation',
          module: 'distribution',
          status: 'pending',
          data: { salesOrderId },
          timestamp: new Date(),
        },
        {
          id: 'delivery_execution',
          name: 'Delivery Execution',
          module: 'distribution',
          status: 'pending',
          data: { salesOrderId },
          timestamp: new Date(),
        },
        {
          id: 'proof_of_delivery',
          name: 'Proof of Delivery',
          module: 'distribution',
          status: 'pending',
          data: { salesOrderId },
          timestamp: new Date(),
        },
      ],
      metadata: {
        sourceId: salesOrderId,
        priority: 'normal',
      },
    })

    await this.executeWorkflowStep(workflow.data.id, 'order_validation')
    return workflow
  }

  // Execute workflow step
  async executeWorkflowStep(workflowId: string, stepId: string): Promise<ApiResponse<IntegrationWorkflow>> {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error("Workflow not found")
    }

    const step = workflow.steps.find(s => s.id === stepId)
    if (!step) {
      throw new Error("Step not found")
    }

    // Update step status to in_progress
    await this.updateWorkflowStep(workflowId, stepId, {
      status: 'in_progress',
      timestamp: new Date(),
    })

    try {
      // Execute the step based on module and action
      await this.executeStepAction(step)
      
      // Mark step as completed
      await this.updateWorkflowStep(workflowId, stepId, {
        status: 'completed',
        timestamp: new Date(),
      })

      // Check if there are next steps to execute
      const nextStep = this.getNextStep(workflow, stepId)
      if (nextStep) {
        // Auto-execute next step if it's ready
        setTimeout(() => {
          this.executeWorkflowStep(workflowId, nextStep.id)
        }, 1000)
      }

    } catch (error) {
      // Mark step as failed
      await this.updateWorkflowStep(workflowId, stepId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      })
    }

    return this.getWorkflow(workflowId)
  }

  private async executeStepAction(step: WorkflowStep): Promise<void> {
    // This is where the actual integration logic would be implemented
    // For now, we'll simulate the execution with a delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Simulate different actions based on step name
    switch (step.name) {
      case 'Purchase Order Approval':
        // Call procurement API to approve PO
        break
      case 'Supplier Notification':
        // Send notification to supplier
        break
      case 'Delivery Receipt':
        // Process goods receipt
        break
      case 'Quality Sampling':
        // Create QC sample request
        break
      case 'QC Testing':
        // Execute QC tests
        break
      case 'QA Review':
        // Perform QA review
        break
      case 'Material Consumption':
        // Consume materials for production
        break
      case 'Production Execution':
        // Execute manufacturing process
        break
      case 'Order Validation':
        // Validate sales order
        break
      case 'Inventory Allocation':
        // Allocate inventory for order
        break
      case 'Shipment Creation':
        // Create shipment
        break
      case 'Delivery Execution':
        // Execute delivery
        break
      case 'Proof of Delivery':
        // Process POD
        break
      default:
        console.log(`Executing step: ${step.name}`)
    }
  }

  private getNextStep(workflow: IntegrationWorkflow, currentStepId: string): WorkflowStep | null {
    const currentIndex = workflow.steps.findIndex(s => s.id === currentStepId)
    if (currentIndex === -1 || currentIndex >= workflow.steps.length - 1) {
      return null
    }
    return workflow.steps[currentIndex + 1]
  }

  // Real-time workflow monitoring
  async getActiveWorkflows(): Promise<ApiResponse<IntegrationWorkflow[]>> {
    const activeWorkflows = Array.from(this.workflows.values())
      .filter(w => w.status === 'in_progress' || w.status === 'pending')

    return {
      success: true,
      data: activeWorkflows,
      message: "Active workflows retrieved successfully"
    }
  }

  // Workflow analytics
  async getWorkflowAnalytics(period?: string): Promise<ApiResponse<{
    totalWorkflows: number
    completedWorkflows: number
    failedWorkflows: number
    averageCompletionTime: number
    modulePerformance: Record<string, number>
  }>> {
    const workflows = Array.from(this.workflows.values())
    
    const analytics = {
      totalWorkflows: workflows.length,
      completedWorkflows: workflows.filter(w => w.status === 'completed').length,
      failedWorkflows: workflows.filter(w => w.status === 'failed').length,
      averageCompletionTime: 0, // Would be calculated from actual data
      modulePerformance: {} as Record<string, number>
    }

    // Calculate module performance
    const moduleStats: Record<string, { total: number; completed: number }> = {}
    workflows.forEach(workflow => {
      workflow.steps.forEach(step => {
        if (!moduleStats[step.module]) {
          moduleStats[step.module] = { total: 0, completed: 0 }
        }
        moduleStats[step.module].total++
        if (step.status === 'completed') {
          moduleStats[step.module].completed++
        }
      })
    })

    Object.entries(moduleStats).forEach(([module, stats]) => {
      analytics.modulePerformance[module] = (stats.completed / stats.total) * 100
    })

    return {
      success: true,
      data: analytics,
      message: "Workflow analytics retrieved successfully"
    }
  }
}

export const integrationService = new IntegrationService()
