import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockMovementRecords } from "@/lib/warehouse-mock-data"
import { validateText } from "@/lib/validations"
import type { MovementRecord, MovementFilters, WarehouseAPIResponse } from "@/types/warehouse"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "distribution_ops", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const movementType = searchParams.get("movementType")
      const materialId = searchParams.get("materialId")
      const fromLocation = searchParams.get("fromLocation")
      const toLocation = searchParams.get("toLocation")
      const performedBy = searchParams.get("performedBy")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredMovements = [...mockMovementRecords]

      // Apply search filter
      if (search) {
        filteredMovements = filteredMovements.filter(
          (movement) =>
            movement.movementNumber.toLowerCase().includes(search.toLowerCase()) ||
            movement.materialName.toLowerCase().includes(search.toLowerCase()) ||
            movement.materialCode.toLowerCase().includes(search.toLowerCase()) ||
            movement.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            movement.fromLocation.toLowerCase().includes(search.toLowerCase()) ||
            movement.toLocation.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (movementType) {
        filteredMovements = filteredMovements.filter((movement) => movement.movementType === movementType)
      }

      if (materialId) {
        filteredMovements = filteredMovements.filter((movement) => movement.materialId === materialId)
      }

      if (fromLocation) {
        filteredMovements = filteredMovements.filter((movement) => movement.fromLocation === fromLocation)
      }

      if (toLocation) {
        filteredMovements = filteredMovements.filter((movement) => movement.toLocation === toLocation)
      }

      if (performedBy) {
        filteredMovements = filteredMovements.filter((movement) => movement.performedBy === performedBy)
      }

      if (dateFrom) {
        filteredMovements = filteredMovements.filter((movement) => movement.performedAt >= dateFrom)
      }

      if (dateTo) {
        filteredMovements = filteredMovements.filter((movement) => movement.performedAt <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedMovements = filteredMovements.slice(startIndex, endIndex)

      const response: WarehouseAPIResponse<{ movements: MovementRecord[]; pagination: any }> = {
        success: true,
        data: {
          movements: paginatedMovements,
          pagination: {
            page,
            limit,
            total: filteredMovements.length,
            totalPages: Math.ceil(filteredMovements.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get movement records error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "distribution_ops"])(request, async (req, user) => {
    try {
      const movementData = await request.json()

      // Validation
      const { movementType, materialId, materialName, materialCode, batchNumber, quantity, unit, fromLocation, toLocation, reason } = movementData

      if (!movementType || !materialId || !materialName || !materialCode || !batchNumber || !quantity || !unit || !fromLocation || !toLocation || !reason) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(materialName, 2, 100)) {
        return Response.json({ success: false, error: "Material name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (quantity <= 0) {
        return Response.json({ success: false, error: "Quantity must be greater than 0" }, { status: 400 })
      }

      // Generate movement number
      const movementNumber = `MOV-${String(mockMovementRecords.length + 1).padStart(3, '0')}`

      const newMovement: MovementRecord = {
        id: (mockMovementRecords.length + 1).toString(),
        movementNumber,
        movementType,
        materialId,
        materialName,
        materialCode,
        batchNumber,
        quantity: Number(quantity),
        unit,
        fromLocation,
        toLocation,
        fromZone: movementData.fromZone || "A",
        toZone: movementData.toZone || "B",
        fromRack: movementData.fromRack || "01",
        toRack: movementData.toRack || "02",
        fromShelf: movementData.fromShelf || "01",
        toShelf: movementData.toShelf || "01",
        fromPosition: movementData.fromPosition || "01",
        toPosition: movementData.toPosition || "01",
        reason,
        performedBy: user.userId.toString(),
        performedByName: user.name || "Unknown User",
        performedAt: new Date().toISOString(),
        referenceDocument: movementData.referenceDocument,
        referenceNumber: movementData.referenceNumber,
        remarks: movementData.remarks
      }

      mockMovementRecords.push(newMovement)

      const response: WarehouseAPIResponse<MovementRecord> = {
        success: true,
        data: newMovement,
        message: "Movement record created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create movement record error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "distribution_ops"])(request, async (req, user) => {
    try {
      const movementData = await request.json()
      const { id, ...updateData } = movementData

      const movementIndex = mockMovementRecords.findIndex((movement) => movement.id === id)
      if (movementIndex === -1) {
        return Response.json({ success: false, error: "Movement record not found" }, { status: 404 })
      }

      // Update movement
      mockMovementRecords[movementIndex] = {
        ...mockMovementRecords[movementIndex],
        ...updateData,
      }

      const response: WarehouseAPIResponse<MovementRecord> = {
        success: true,
        data: mockMovementRecords[movementIndex],
        message: "Movement record updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update movement record error:", error)
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
        return Response.json({ success: false, error: "Movement record ID is required" }, { status: 400 })
      }

      const movementIndex = mockMovementRecords.findIndex((movement) => movement.id === id)
      if (movementIndex === -1) {
        return Response.json({ success: false, error: "Movement record not found" }, { status: 404 })
      }

      const deletedMovement = mockMovementRecords.splice(movementIndex, 1)[0]

      const response: WarehouseAPIResponse<MovementRecord> = {
        success: true,
        data: deletedMovement,
        message: "Movement record deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete movement record error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
