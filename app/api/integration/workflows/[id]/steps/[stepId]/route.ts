import { NextRequest, NextResponse } from 'next/server'

// Mock data - in a real app, this would be stored in a database
const mockWorkflows = new Map([
  ['wf_1', {
    id: 'wf_1',
    type: 'procurement_to_supplier',
    status: 'in_progress',
    steps: [
      {
        id: 'po_approval',
        name: 'Purchase Order Approval',
        module: 'procurement',
        status: 'completed',
        data: { poId: 'po_123' },
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'supplier_notification',
        name: 'Supplier Notification',
        module: 'procurement',
        status: 'in_progress',
        data: { poId: 'po_123' },
        timestamp: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'supplier_acknowledgment',
        name: 'Supplier Acknowledgment',
        module: 'procurement',
        status: 'pending',
        data: { poId: 'po_123' },
        timestamp: new Date('2024-01-15T11:00:00Z'),
      },
    ],
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    metadata: {
      sourceId: 'po_123',
      priority: 'normal',
    },
  }],
])

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const body = await request.json()
    const workflow = mockWorkflows.get(params.id)
    
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      )
    }

    const stepIndex = workflow.steps.findIndex(step => step.id === params.stepId)
    if (stepIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Step not found',
        },
        { status: 404 }
      )
    }

    // Update the step
    workflow.steps[stepIndex] = {
      ...workflow.steps[stepIndex],
      ...body,
      timestamp: new Date(),
    }

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

    workflow.updatedAt = new Date()
    mockWorkflows.set(params.id, workflow)

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow step updated successfully',
    })
  } catch (error) {
    console.error('Error updating workflow step:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workflow step',
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; stepId: string } }
) {
  try {
    const workflow = mockWorkflows.get(params.id)
    
    if (!workflow) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow not found',
        },
        { status: 404 }
      )
    }

    const step = workflow.steps.find(step => step.id === params.stepId)
    if (!step) {
      return NextResponse.json(
        {
          success: false,
          error: 'Step not found',
        },
        { status: 404 }
      )
    }

    // Simulate step execution
    if (step.status === 'pending') {
      step.status = 'in_progress'
      step.timestamp = new Date()
      
      // Simulate processing time
      setTimeout(() => {
        step.status = 'completed'
        step.timestamp = new Date()
        workflow.updatedAt = new Date()
        
        // Update workflow status
        const allCompleted = workflow.steps.every(s => s.status === 'completed')
        if (allCompleted) {
          workflow.status = 'completed'
        }
        
        mockWorkflows.set(params.id, workflow)
      }, 2000)
    }

    workflow.updatedAt = new Date()
    mockWorkflows.set(params.id, workflow)

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow step execution started',
    })
  } catch (error) {
    console.error('Error executing workflow step:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute workflow step',
      },
      { status: 500 }
    )
  }
}
