"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Beaker, ArrowRight, FileText } from "lucide-react"

export default function NewBatchPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">New Batch</h1>
          <p className="text-muted-foreground">
            Create a new production batch from a work order or BOM.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Start from Work Order
            </CardTitle>
            <CardDescription>
              Batches are typically created from an existing work order. Open work orders to start a batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/manufacturing/work-orders")}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Go to Work Orders
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              View Batches
            </CardTitle>
            <CardDescription>
              Return to the batch list to view or edit existing batches.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => router.push("/dashboard/manufacturing/batches")}>
              Back to Batches
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
