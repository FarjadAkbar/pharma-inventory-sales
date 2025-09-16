"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Key, 
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Filter,
  Search,
} from "lucide-react"
import { useEnhancedPermissions } from "@/hooks/use-enhanced-permissions"
import { formatDateISO } from "@/lib/utils"

interface AuditLog {
  id: string
  userId: string
  userName: string
  userRole: string
  action: string
  resource: string
  module: string
  screen: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
  status: "success" | "failure" | "warning"
  severity: "low" | "medium" | "high" | "critical"
}

interface SecurityEvent {
  id: string
  type: "login" | "logout" | "permission_denied" | "suspicious_activity" | "data_access" | "configuration_change"
  userId: string
  userName: string
  description: string
  severity: "low" | "medium" | "high" | "critical"
  timestamp: string
  resolved: boolean
  resolution?: string
}

interface PermissionCheck {
  id: string
  userId: string
  userName: string
  module: string
  screen: string
  action: string
  result: "allowed" | "denied"
  timestamp: string
  reason?: string
}

interface ComplianceReport {
  id: string
  reportType: "audit_trail" | "permission_matrix" | "security_events" | "compliance_summary"
  generatedBy: string
  generatedAt: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalEvents: number
    securityIncidents: number
    permissionViolations: number
    complianceScore: number
  }
  status: "generated" | "processing" | "failed"
  fileUrl?: string
}

export function SecurityAudit() {
  const [activeTab, setActiveTab] = useState("audit")
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [permissionChecks, setPermissionChecks] = useState<PermissionCheck[]>([])
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [severityFilter, setSeverityFilter] = useState("all")
  const { role: userRole, isSystemAdmin, can } = useEnhancedPermissions()

  useEffect(() => {
    fetchAuditData()
  }, [timeRange, severityFilter])

  const fetchAuditData = async () => {
    try {
      setLoading(true)
      // Mock data - in real implementation, this would come from API
      const mockAuditLogs: AuditLog[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Admin",
          userRole: "System Admin",
          action: "LOGIN",
          resource: "Authentication",
          module: "identity",
          screen: "users",
          details: "Successful login from IP 192.168.1.100",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2024-01-15T10:30:00Z",
          status: "success",
          severity: "low",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Manager",
          userRole: "Org Admin",
          action: "PERMISSION_DENIED",
          resource: "User Management",
          module: "identity",
          screen: "roles",
          details: "Attempted to assign system admin role without permission",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          timestamp: "2024-01-15T10:25:00Z",
          status: "failure",
          severity: "medium",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Bob Procurement",
          userRole: "Procurement Manager",
          action: "DATA_ACCESS",
          resource: "Purchase Orders",
          module: "procurement",
          screen: "purchase_orders",
          details: "Viewed purchase order PO-2024-001",
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: "2024-01-15T10:20:00Z",
          status: "success",
          severity: "low",
        },
      ]

      const mockSecurityEvents: SecurityEvent[] = [
        {
          id: "1",
          type: "suspicious_activity",
          userId: "user2",
          userName: "Jane Manager",
          description: "Multiple failed permission attempts detected",
          severity: "medium",
          timestamp: "2024-01-15T10:25:00Z",
          resolved: false,
        },
        {
          id: "2",
          type: "permission_denied",
          userId: "user4",
          userName: "Alice Sales",
          description: "Attempted to access restricted financial data",
          severity: "high",
          timestamp: "2024-01-15T09:45:00Z",
          resolved: true,
          resolution: "User role updated to include financial access",
        },
      ]

      const mockPermissionChecks: PermissionCheck[] = [
        {
          id: "1",
          userId: "user1",
          userName: "John Admin",
          module: "identity",
          screen: "users",
          action: "create",
          result: "allowed",
          timestamp: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Jane Manager",
          module: "identity",
          screen: "roles",
          action: "assign_permissions",
          result: "denied",
          reason: "Insufficient role permissions",
          timestamp: "2024-01-15T10:25:00Z",
        },
      ]

      const mockComplianceReports: ComplianceReport[] = [
        {
          id: "1",
          reportType: "audit_trail",
          generatedBy: "System Admin",
          generatedAt: "2024-01-15T10:00:00Z",
          period: {
            start: "2024-01-01T00:00:00Z",
            end: "2024-01-15T23:59:59Z",
          },
          summary: {
            totalEvents: 1250,
            securityIncidents: 3,
            permissionViolations: 12,
            complianceScore: 95,
          },
          status: "generated",
          fileUrl: "/reports/audit-trail-2024-01-15.pdf",
        },
      ]

      setAuditLogs(mockAuditLogs)
      setSecurityEvents(mockSecurityEvents)
      setPermissionChecks(mockPermissionChecks)
      setComplianceReports(mockComplianceReports)
    } catch (error) {
      console.error("Failed to fetch audit data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failure":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <User className="h-4 w-4 text-green-500" />
      case "logout":
        return <User className="h-4 w-4 text-gray-500" />
      case "permission_denied":
        return <Lock className="h-4 w-4 text-red-500" />
      case "suspicious_activity":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "data_access":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "configuration_change":
        return <RefreshCw className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const calculateStats = () => {
    const totalEvents = auditLogs.length
    const securityIncidents = securityEvents.filter(e => !e.resolved).length
    const permissionViolations = permissionChecks.filter(p => p.result === "denied").length
    const complianceScore = Math.max(0, 100 - (securityIncidents * 10) - (permissionViolations * 5))

    return { totalEvents, securityIncidents, permissionViolations, complianceScore }
  }

  const stats = calculateStats()

  const auditLogsColumns = [
    {
      key: "user",
      header: "User",
      render: (log: AuditLog) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{log.userName}</div>
            <div className="text-sm text-muted-foreground">{log.userRole}</div>
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action",
      render: (log: AuditLog) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(log.status)}
          <div>
            <div className="font-medium">{log.action}</div>
            <div className="text-sm text-muted-foreground">{log.resource}</div>
          </div>
        </div>
      ),
    },
    {
      key: "module",
      header: "Module",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium">{log.module}</div>
          <div className="text-muted-foreground">{log.screen}</div>
        </div>
      ),
    },
    {
      key: "details",
      header: "Details",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="truncate max-w-48">{log.details}</div>
          <div className="text-muted-foreground">{log.ipAddress}</div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (log: AuditLog) => (
        <Badge className={getSeverityBadgeColor(log.severity)}>
          {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
        </Badge>
      ),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (log: AuditLog) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatDateISO(log.timestamp)}</span>
          </div>
        </div>
      ),
    },
  ]

  const securityEventsColumns = [
    {
      key: "event",
      header: "Event",
      render: (event: SecurityEvent) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            {getEventTypeIcon(event.type)}
          </div>
          <div>
            <div className="font-medium">{event.type.replace(/_/g, ' ').toUpperCase()}</div>
            <div className="text-sm text-muted-foreground">{event.userName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (event: SecurityEvent) => (
        <div className="text-sm">
          <div className="truncate max-w-64">{event.description}</div>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (event: SecurityEvent) => (
        <Badge className={getSeverityBadgeColor(event.severity)}>
          {event.severity.charAt(0).toUpperCase() + event.severity.slice(1)}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (event: SecurityEvent) => (
        <Badge variant={event.resolved ? "default" : "destructive"}>
          {event.resolved ? "Resolved" : "Open"}
        </Badge>
      ),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (event: SecurityEvent) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatDateISO(event.timestamp)}</span>
          </div>
        </div>
      ),
    },
  ]

  const permissionChecksColumns = [
    {
      key: "user",
      header: "User",
      render: (check: PermissionCheck) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{check.userName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "permission",
      header: "Permission",
      render: (check: PermissionCheck) => (
        <div className="text-sm">
          <div className="font-medium">{check.module}.{check.screen}.{check.action}</div>
        </div>
      ),
    },
    {
      key: "result",
      header: "Result",
      render: (check: PermissionCheck) => (
        <div className="flex items-center gap-2">
          {check.result === "allowed" ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
          <Badge variant={check.result === "allowed" ? "default" : "destructive"}>
            {check.result.charAt(0).toUpperCase() + check.result.slice(1)}
          </Badge>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (check: PermissionCheck) => (
        <div className="text-sm">
          {check.reason ? (
            <div className="text-muted-foreground">{check.reason}</div>
          ) : (
            <span className="text-green-600">Permission granted</span>
          )}
        </div>
      ),
    },
    {
      key: "timestamp",
      header: "Timestamp",
      render: (check: PermissionCheck) => (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatDateISO(check.timestamp)}</span>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Audit</h1>
          <p className="text-muted-foreground">Monitor security events and compliance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.securityIncidents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permission Violations</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.permissionViolations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.complianceScore}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="permissions">Permission Checks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Complete audit trail of all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={auditLogs}
                columns={auditLogsColumns}
                loading={loading}
                searchPlaceholder="Search audit logs..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Security incidents and suspicious activities</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={securityEvents}
                columns={securityEventsColumns}
                loading={loading}
                searchPlaceholder="Search security events..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Checks</CardTitle>
              <CardDescription>Real-time permission validation logs</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={permissionChecks}
                columns={permissionChecksColumns}
                loading={loading}
                searchPlaceholder="Search permission checks..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generated compliance and audit reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium">{report.reportType.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="text-sm text-muted-foreground">
                          Generated by {report.generatedBy} on {formatDateISO(report.generatedAt)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Period: {formatDateISO(report.period.start)} to {formatDateISO(report.period.end)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === "generated" ? "default" : "secondary"}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </Badge>
                      {report.fileUrl && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
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
