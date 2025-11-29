import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Mock analytics data - in a real app, this would be calculated from actual data
    const analytics = {
      totalWorkflows: 156,
      completedWorkflows: 142,
      failedWorkflows: 8,
      averageCompletionTime: 4.2, // hours
      modulePerformance: {
        procurement: 96.5,
        warehouse: 94.8,
        quality_control: 98.2,
        quality_assurance: 97.1,
        manufacturing: 95.3,
        distribution: 93.7,
      },
      workflowTypes: {
        procurement_to_supplier: 45,
        supplier_to_warehouse: 38,
        warehouse_to_quality: 32,
        manufacturing_to_finished: 28,
        sales_to_distribution: 13,
      },
      trends: {
        daily: [
          { date: '2024-01-01', completed: 12, failed: 1 },
          { date: '2024-01-02', completed: 15, failed: 0 },
          { date: '2024-01-03', completed: 18, failed: 2 },
          { date: '2024-01-04', completed: 14, failed: 1 },
          { date: '2024-01-05', completed: 16, failed: 0 },
        ],
        weekly: [
          { week: 'W1', completed: 89, failed: 3 },
          { week: 'W2', completed: 92, failed: 2 },
          { week: 'W3', completed: 88, failed: 4 },
          { week: 'W4', completed: 95, failed: 1 },
        ],
      },
      bottlenecks: [
        {
          module: 'quality_control',
          averageDelay: 2.3,
          frequency: 15,
          impact: 'high',
        },
        {
          module: 'warehouse',
          averageDelay: 1.8,
          frequency: 8,
          impact: 'medium',
        },
      ],
      efficiency: {
        overall: 94.3,
        byModule: {
          procurement: 96.5,
          warehouse: 94.8,
          quality_control: 98.2,
          quality_assurance: 97.1,
          manufacturing: 95.3,
          distribution: 93.7,
        },
      },
    }

    // Adjust analytics based on period
    if (period === '7d') {
      analytics.totalWorkflows = 42
      analytics.completedWorkflows = 38
      analytics.failedWorkflows = 2
      analytics.averageCompletionTime = 3.8
    } else if (period === '90d') {
      analytics.totalWorkflows = 467
      analytics.completedWorkflows = 425
      analytics.failedWorkflows = 24
      analytics.averageCompletionTime = 4.5
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Workflow analytics retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching workflow analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflow analytics',
      },
      { status: 500 }
    )
  }
}
