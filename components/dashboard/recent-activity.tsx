import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: "sale" | "product" | "user" | "vendor"
  description: string
  timestamp: string
  status: "success" | "pending" | "failed"
}

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "sale",
    description: "New sale completed - Order #1234",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    type: "product",
    description: "Product 'Laptop Pro' updated",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: "3",
    type: "user",
    description: "New user registered - John Doe",
    timestamp: "1 hour ago",
    status: "pending",
  },
  {
    id: "4",
    type: "vendor",
    description: "Vendor 'Tech Supply Co' added",
    timestamp: "2 hours ago",
    status: "success",
  },
]

export function RecentActivity() {
  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: Activity["type"]) => {
    switch (type) {
      case "sale":
        return "bg-blue-100 text-blue-800"
      case "product":
        return "bg-purple-100 text-purple-800"
      case "user":
        return "bg-green-100 text-green-800"
      case "vendor":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your CRM system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={getTypeColor(activity.type)}>
                  {activity.type}
                </Badge>
                <div>
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
              <Badge variant="outline" className={getStatusColor(activity.status)}>
                {activity.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
