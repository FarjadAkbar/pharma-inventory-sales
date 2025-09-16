import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockPutawayTasks } from "@/lib/warehouse-mock-data"
import { validateText } from "@/lib/validations"
import type { PutawayTask, PutawayFilters, WarehouseAPIResponse } from "@/types/warehouse"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const assignedTo = searchParams.get("assignedTo")
      const zone = searchParams.get("zone")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredTasks = [...mockPutawayTasks]

      // Apply search filter
      if (search) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.taskNumber.toLowerCase().includes(search.toLowerCase()) ||
            task.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
            task.materialName.toLowerCase().includes(search.toLowerCase()) ||
            task.materialCode.toLowerCase().includes(search.toLowerCase()) ||
            task.batchNumber.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (status) {
        filteredTasks = filteredTasks.filter((task) => task.status === status)
      }

      if (priority) {
        filteredTasks = filteredTasks.filter((task) => task.priority === priority)
      }

      if (assignedTo) {
        filteredTasks = filteredTasks.filter((task) => task.assignedTo === assignedTo)
      }

      if (zone) {
        filteredTasks = filteredTasks.filter((task) => task.targetZone === zone)
      }

      if (dateFrom) {
        filteredTasks = filteredTasks.filter((task) => task.assignedAt >= dateFrom)
      }

      if (dateTo) {
        filteredTasks = filteredTasks.filter((task) => task.assignedAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

      const response: WarehouseAPIResponse<{ putawayTasks: PutawayTask[]; pagination: any }> = {
        success: true,
        data: {
          putawayTasks: paginatedTasks,
          pagination: {
            page,
            limit,
            total: filteredTasks.length,
            totalPages: Math.ceil(filteredTasks.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get putaway tasks error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const taskData = await request.json()

      // Validation
      const { grnId, grnNumber, materialId, materialName, materialCode, batchNumber, quantity, unit, sourceLocation } = taskData

      if (!grnId || !grnNumber || !materialId || !materialName || !materialCode || !batchNumber || !quantity || !unit || !sourceLocation) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(materialName, 2, 100)) {
        return Response.json({ success: false, error: "Material name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (quantity <= 0) {
        return Response.json({ success: false, error: "Quantity must be greater than 0" }, { status: 400 })
      }

      // Generate task number
      const taskNumber = `PUT-${String(mockPutawayTasks.length + 1).padStart(3, '0')}`

      const newTask: PutawayTask = {
        id: (mockPutawayTasks.length + 1).toString(),
        taskNumber,
        grnId,
        grnNumber,
        materialId,
        materialName,
        materialCode,
        batchNumber,
        quantity: Number(quantity),
        unit,
        status: taskData.status || "Pending",
        priority: taskData.priority || "Normal",
        assignedTo: taskData.assignedTo || user.userId.toString(),
        assignedToName: taskData.assignedToName || user.name || "Unknown User",
        assignedAt: new Date().toISOString(),
        startedAt: taskData.startedAt,
        completedAt: taskData.completedAt,
        sourceLocation,
        targetLocation: taskData.targetLocation,
        targetZone: taskData.targetZone,
        targetRack: taskData.targetRack,
        targetShelf: taskData.targetShelf,
        targetPosition: taskData.targetPosition,
        temperatureCompliance: taskData.temperatureCompliance || true,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        remarks: taskData.remarks
      }

      mockPutawayTasks.push(newTask)

      const response: WarehouseAPIResponse<PutawayTask> = {
        success: true,
        data: newTask,
        message: "Putaway task created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create putaway task error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const taskData = await request.json()
      const { id, ...updateData } = taskData

      const taskIndex = mockPutawayTasks.findIndex((task) => task.id === id)
      if (taskIndex === -1) {
        return Response.json({ success: false, error: "Putaway task not found" }, { status: 404 })
      }

      // Update task
      mockPutawayTasks[taskIndex] = {
        ...mockPutawayTasks[taskIndex],
        ...updateData,
      }

      const response: WarehouseAPIResponse<PutawayTask> = {
        success: true,
        data: mockPutawayTasks[taskIndex],
        message: "Putaway task updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update putaway task error:", error)
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
        return Response.json({ success: false, error: "Putaway task ID is required" }, { status: 400 })
      }

      const taskIndex = mockPutawayTasks.findIndex((task) => task.id === id)
      if (taskIndex === -1) {
        return Response.json({ success: false, error: "Putaway task not found" }, { status: 404 })
      }

      const deletedTask = mockPutawayTasks.splice(taskIndex, 1)[0]

      const response: WarehouseAPIResponse<PutawayTask> = {
        success: true,
        data: deletedTask,
        message: "Putaway task deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete putaway task error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
