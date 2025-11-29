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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflow',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const updatedWorkflow = {
      ...workflow,
      ...body,
      updatedAt: new Date(),
    }

    mockWorkflows.set(params.id, updatedWorkflow)

    return NextResponse.json({
      success: true,
      data: updatedWorkflow,
      message: 'Workflow updated successfully',
    })
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update workflow',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    mockWorkflows.delete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete workflow',
      },
      { status: 500 }
    )
  }
}
