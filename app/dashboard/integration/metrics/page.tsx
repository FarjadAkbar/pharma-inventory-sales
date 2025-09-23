"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, 
  Shield, 
  Zap, 
  CheckCircle, 
  TrendingUp, 
  BarChart3,
  RefreshCw,
  Download,
  AlertTriangle,
  Activity
} from 'lucide-react'
import { useComplianceMetrics } from '@/hooks/use-integration'

export default function ComplianceMetricsPage() {
  const [period, setPeriod] = useState('30d')
  const { metrics, loading, error, loadMetrics } = useComplianceMetrics(period)

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 95) return 'bg-green-100'
    if (score >= 90) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="h-4 w-4" />
    if (score >= 90) return <AlertTriangle className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
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
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Metrics</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadMetrics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Metrics Available</h3>
            <p className="text-muted-foreground">Compliance metrics will appear here once workflows are running.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const metricsData = [
    {
      label: 'On-Time In-Full (OTIF)',
      value: metrics.otif,
      icon: <Target className="h-6 w-6" />,
      description: 'Percentage of orders delivered on time and in full',
      trend: '+2.1%',
      trendUp: true,
    },
    {
      label: 'Quality Score',
      value: metrics.qualityScore,
      icon: <Shield className="h-6 w-6" />,
      description: 'Overall quality compliance across all processes',
      trend: '+0.8%',
      trendUp: true,
    },
    {
      label: 'Traceability Score',
      value: metrics.traceabilityScore,
      icon: <Zap className="h-6 w-6" />,
      description: 'Complete product traceability from source to delivery',
      trend: '+0.3%',
      trendUp: true,
    },
    {
      label: 'Regulatory Compliance',
      value: metrics.regulatoryCompliance,
      icon: <CheckCircle className="h-6 w-6" />,
      description: 'Adherence to pharmaceutical regulatory requirements',
      trend: '+1.2%',
      trendUp: true,
    },
    {
      label: 'Efficiency Score',
      value: metrics.efficiencyScore,
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Overall process efficiency and optimization',
      trend: '+1.5%',
      trendUp: true,
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Metrics</h1>
          <p className="text-muted-foreground">
            Monitor pharmaceutical supply chain compliance and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadMetrics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${getScoreBgColor(metric.value)}`}>
                  <div className={getScoreColor(metric.value)}>
                    {metric.icon}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(metric.value)}`}>
                    {metric.value}%
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    {getScoreIcon(metric.value)}
                    <span className="ml-1">{metric.trend}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{metric.label}</h3>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Performance</CardTitle>
                <CardDescription>
                  Comprehensive view of all compliance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metricsData.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className={`text-sm font-bold ${getScoreColor(metric.value)}`}>
                        {metric.value}%
                      </span>
                    </div>
                    <Progress value={metric.value} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
                <CardDescription>
                  Key performance indicators and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Quality Standards</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Regulatory Compliance</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                      <span className="font-medium">Delivery Performance</span>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span className="font-medium">Traceability</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Complete</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance trends over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trend Analysis Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed trend analysis and historical charts will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Breakdown</CardTitle>
              <CardDescription>
                Performance breakdown by module and process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { module: 'Procurement', score: 96.5, status: 'excellent' },
                  { module: 'Warehouse', score: 94.8, status: 'good' },
                  { module: 'Quality Control', score: 98.2, status: 'excellent' },
                  { module: 'Quality Assurance', score: 97.1, status: 'excellent' },
                  { module: 'Manufacturing', score: 95.3, status: 'good' },
                  { module: 'Distribution', score: 93.7, status: 'good' },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.module}</span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(item.score)}`}>
                          {item.score}%
                        </span>
                        <Badge 
                          className={
                            item.status === 'excellent' ? 'bg-green-100 text-green-800' :
                            item.status === 'good' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>
                Active alerts and recommendations for improvement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Delivery Performance Alert</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      OTIF score is below target. Consider reviewing supplier performance and delivery schedules.
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Efficiency Improvement</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Manufacturing efficiency can be improved by optimizing batch scheduling.
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800">Quality Excellence</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Quality control processes are performing exceptionally well. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
