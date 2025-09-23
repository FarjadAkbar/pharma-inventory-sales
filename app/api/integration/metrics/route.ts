import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Mock compliance metrics - in a real app, this would be calculated from actual data
    const metrics = {
      otif: 95.5, // On-Time In-Full delivery percentage
      qualityScore: 98.2, // Quality compliance score
      traceabilityScore: 99.1, // Complete traceability percentage
      regulatoryCompliance: 97.8, // Regulatory compliance score
      efficiencyScore: 94.3, // Overall process efficiency
    }

    // Adjust metrics based on period
    if (period === '7d') {
      metrics.otif = 97.2
      metrics.qualityScore = 98.8
      metrics.traceabilityScore = 99.5
      metrics.regulatoryCompliance = 98.1
      metrics.efficiencyScore = 95.1
    } else if (period === '90d') {
      metrics.otif = 94.8
      metrics.qualityScore = 97.9
      metrics.traceabilityScore = 98.8
      metrics.regulatoryCompliance = 97.5
      metrics.efficiencyScore = 93.7
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      message: 'Compliance metrics retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching compliance metrics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch compliance metrics',
      },
      { status: 500 }
    )
  }
}
