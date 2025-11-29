import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockWorkOrders } from "@/lib/manufacturing-mock-data"
import { validateText } from "@/lib/validations"
import type { WorkOrder, WorkOrderFilters, ManufacturingAPIResponse } from "@/types/manufacturing"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const drugId = searchParams.get("drugId")
      const siteId = searchParams.get("siteId")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const assignedTo = searchParams.get("assignedTo")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredWorkOrders = [...mockWorkOrders]

      // Apply search filter
      if (search) {
        filteredWorkOrders = filteredWorkOrders.filter(
          (wo) =>
            wo.workOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
            wo.drugName.toLowerCase().includes(search.toLowerCase()) ||
            wo.drugCode.toLowerCase().includes(search.toLowerCase()) ||
            wo.siteName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (drugId) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.drugId === drugId)
      }

      if (siteId) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.siteId === siteId)
      }

      if (status) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.status === status)
      }

      if (priority) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.priority === priority)
      }

      if (assignedTo) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.assignedTo === assignedTo)
      }

      if (dateFrom) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.plannedStartDate >= dateFrom)
      }

      if (dateTo) {
        filteredWorkOrders = filteredWorkOrders.filter((wo) => wo.plannedStartDate <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedWorkOrders = filteredWorkOrders.slice(startIndex, endIndex)

      const response: ManufacturingAPIResponse<{ workOrders: WorkOrder[]; pagination: any }> = {
        success: true,
        data: {
          workOrders: paginatedWorkOrders,
          pagination: {
            page,
            limit,
            total: filteredWorkOrders.length,
            totalPages: Math.ceil(filteredWorkOrders.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get work orders error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const workOrderData = await request.json()

      // Validation
      const { drugId, drugName, drugCode, siteId, siteName, plannedQuantity, unit, bomVersion } = workOrderData

      if (!drugId || !drugName || !drugCode || !siteId || !siteName || !plannedQuantity || !unit || !bomVersion) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(drugName, 2, 100)) {
        return Response.json({ success: false, error: "Drug name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (plannedQuantity <= 0) {
        return Response.json({ success: false, error: "Planned quantity must be greater than 0" }, { status: 400 })
      }

      // Generate work order number
      const workOrderNumber = `WO-${String(mockWorkOrders.length + 1).padStart(3, '0')}`

      const newWorkOrder: WorkOrder = {
        id: (mockWorkOrders.length + 1).toString(),
        workOrderNumber,
        drugId,
        drugName,
        drugCode,
        siteId,
        siteName,
        plannedQuantity: Number(plannedQuantity),
        unit,
        bomVersion: Number(bomVersion),
        status: workOrderData.status || "Draft",
        priority: workOrderData.priority || "Normal",
        plannedStartDate: workOrderData.plannedStartDate,
        plannedEndDate: workOrderData.plannedEndDate,
        assignedTo: workOrderData.assignedTo || user.userId.toString(),
        assignedToName: workOrderData.assignedToName || user.name || "Unknown User",
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        remarks: workOrderData.remarks
      }

      mockWorkOrders.push(newWorkOrder)

      const response: ManufacturingAPIResponse<WorkOrder> = {
        success: true,
        data: newWorkOrder,
        message: "Work order created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create work order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "production_manager"])(request, async (req, user) => {
    try {
      const workOrderData = await request.json()
      const { id, ...updateData } = workOrderData

      const workOrderIndex = mockWorkOrders.findIndex((wo) => wo.id === id)
      if (workOrderIndex === -1) {
        return Response.json({ success: false, error: "Work order not found" }, { status: 404 })
      }

      // Update work order
      mockWorkOrders[workOrderIndex] = {
        ...mockWorkOrders[workOrderIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: ManufacturingAPIResponse<WorkOrder> = {
        success: true,
        data: mockWorkOrders[workOrderIndex],
        message: "Work order updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update work order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
        return Response.json({ success: false, error: "Work order ID is required" }, { status: 400 })
      }

      const workOrderIndex = mockWorkOrders.findIndex((wo) => wo.id === id)
      if (workOrderIndex === -1) {
        return Response.json({ success: false, error: "Work order not found" }, { status: 404 })
      }

      const deletedWorkOrder = mockWorkOrders.splice(workOrderIndex, 1)[0]

      const response: ManufacturingAPIResponse<WorkOrder> = {
        success: true,
        data: deletedWorkOrder,
        message: "Work order deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete work order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
