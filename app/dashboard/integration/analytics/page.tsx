"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Download,
  AlertTriangle,
  Target,
  Zap
} from 'lucide-react'
import { useWorkflowAnalytics } from '@/hooks/use-integration'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')
  const { analytics, loading, error, loadAnalytics } = useWorkflowAnalytics(period)

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
            <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={loadAnalytics} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Available</h3>
            <p className="text-muted-foreground">Analytics will appear here once workflows are running.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const successRate = (analytics.completedWorkflows / analytics.totalWorkflows) * 100
  const failureRate = (analytics.failedWorkflows / analytics.totalWorkflows) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for pharmaceutical supply chain workflows
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
          <Button variant="outline" onClick={loadAnalytics}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{analytics.totalWorkflows}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failure Rate</p>
                <p className="text-2xl font-bold text-red-600">{failureRate.toFixed(1)}%</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{analytics.averageCompletionTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="bottlenecks">Bottlenecks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Workflow Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Types</CardTitle>
                <CardDescription>
                  Distribution of workflows by type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.workflowTypes).map(([type, count]) => {
                  const percentage = (count / analytics.totalWorkflows) * 100
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Module Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Module Performance</CardTitle>
                <CardDescription>
                  Performance scores by module
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(analytics.modulePerformance).map(([module, score]) => (
                  <div key={module} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {module.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="text-sm font-bold">{score.toFixed(1)}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance analysis across all modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800">Completed</h3>
                    <p className="text-2xl font-bold text-green-600">{analytics.completedWorkflows}</p>
                    <p className="text-sm text-green-700">{successRate.toFixed(1)}% success rate</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-red-800">Failed</h3>
                    <p className="text-2xl font-bold text-red-600">{analytics.failedWorkflows}</p>
                    <p className="text-sm text-red-700">{failureRate.toFixed(1)}% failure rate</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800">Avg. Time</h3>
                    <p className="text-2xl font-bold text-blue-600">{analytics.averageCompletionTime}h</p>
                    <p className="text-sm text-blue-700">completion time</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Module Performance Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(analytics.modulePerformance).map(([module, score]) => (
                      <div key={module} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {module.replace(/_/g, ' ').toUpperCase()}
                          </span>
                          <Badge 
                            className={
                              score >= 95 ? 'bg-green-100 text-green-800' :
                              score >= 90 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {score.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical trends and patterns in workflow performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Trend Analysis Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed trend analysis and historical charts will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Process Bottlenecks</CardTitle>
              <CardDescription>
                Identify and analyze workflow bottlenecks and delays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">
                        {bottleneck.module.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <Badge 
                        className={
                          bottleneck.impact === 'high' ? 'bg-red-100 text-red-800' :
                          bottleneck.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }
                      >
                        {bottleneck.impact} impact
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Average Delay:</span>
                        <span className="ml-2 font-medium">{bottleneck.averageDelay}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <span className="ml-2 font-medium">{bottleneck.frequency} occurrences</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Delay Severity</span>
                        <span>{bottleneck.averageDelay}h</span>
                      </div>
                      <Progress 
                        value={(bottleneck.averageDelay / 5) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
