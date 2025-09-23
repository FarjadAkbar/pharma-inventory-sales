import { NextRequest, NextResponse } from 'next/server'

// Mock data for demonstration
const mockWorkflows = [
  {
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
  },
  {
    id: 'wf_2',
    type: 'supplier_to_warehouse',
    status: 'completed',
    steps: [
      {
        id: 'delivery_receipt',
        name: 'Delivery Receipt',
        module: 'warehouse',
        status: 'completed',
        data: { grnId: 'grn_456', poId: 'po_123' },
        timestamp: new Date('2024-01-14T14:00:00Z'),
      },
      {
        id: 'quality_sampling',
        name: 'Quality Sampling',
        module: 'warehouse',
        status: 'completed',
        data: { grnId: 'grn_456' },
        timestamp: new Date('2024-01-14T14:30:00Z'),
      },
      {
        id: 'putaway_assignment',
        name: 'Putaway Assignment',
        module: 'warehouse',
        status: 'completed',
        data: { grnId: 'grn_456' },
        timestamp: new Date('2024-01-14T15:00:00Z'),
      },
    ],
    createdAt: new Date('2024-01-14T14:00:00Z'),
    updatedAt: new Date('2024-01-14T15:00:00Z'),
    metadata: {
      sourceId: 'grn_456',
      targetId: 'po_123',
      priority: 'normal',
    },
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const module = searchParams.get('module')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let filteredWorkflows = [...mockWorkflows]

    // Apply filters
    if (type) {
      filteredWorkflows = filteredWorkflows.filter(w => w.type === type)
    }
    if (status) {
      filteredWorkflows = filteredWorkflows.filter(w => w.status === status)
    }
    if (module) {
      filteredWorkflows = filteredWorkflows.filter(w => 
        w.steps.some(s => s.module === module)
      )
    }
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filteredWorkflows = filteredWorkflows.filter(w => w.createdAt >= fromDate)
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      filteredWorkflows = filteredWorkflows.filter(w => w.createdAt <= toDate)
    }

    return NextResponse.json({
      success: true,
      data: filteredWorkflows,
      message: 'Workflows retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflows',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newWorkflow = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockWorkflows.push(newWorkflow)

    return NextResponse.json({
      success: true,
      data: newWorkflow,
      message: 'Workflow created successfully',
    })
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create workflow',
      },
      { status: 500 }
    )
  }
}
