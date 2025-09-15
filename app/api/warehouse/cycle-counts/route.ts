import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockCycleCounts } from "@/lib/warehouse-mock-data"
import { validateText } from "@/lib/validations"
import type { CycleCount, CycleCountFilters, WarehouseAPIResponse } from "@/types/warehouse"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const countType = searchParams.get("countType")
      const status = searchParams.get("status")
      const assignedTo = searchParams.get("assignedTo")
      const zone = searchParams.get("zone")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredCounts = [...mockCycleCounts]

      // Apply search filter
      if (search) {
        filteredCounts = filteredCounts.filter(
          (count) =>
            count.countNumber.toLowerCase().includes(search.toLowerCase()) ||
            count.assignedToName.toLowerCase().includes(search.toLowerCase()) ||
            count.zone.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (countType) {
        filteredCounts = filteredCounts.filter((count) => count.countType === countType)
      }

      if (status) {
        filteredCounts = filteredCounts.filter((count) => count.status === status)
      }

      if (assignedTo) {
        filteredCounts = filteredCounts.filter((count) => count.assignedTo === assignedTo)
      }

      if (zone) {
        filteredCounts = filteredCounts.filter((count) => count.zone === zone)
      }

      if (dateFrom) {
        filteredCounts = filteredCounts.filter((count) => count.scheduledDate >= dateFrom)
      }

      if (dateTo) {
        filteredCounts = filteredCounts.filter((count) => count.scheduledDate <= dateTo)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCounts = filteredCounts.slice(startIndex, endIndex)

      const response: WarehouseAPIResponse<{ cycleCounts: CycleCount[]; pagination: any }> = {
        success: true,
        data: {
          cycleCounts: paginatedCounts,
          pagination: {
            page,
            limit,
            total: filteredCounts.length,
            totalPages: Math.ceil(filteredCounts.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get cycle counts error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const countData = await request.json()

      // Validation
      const { countType, zone, assignedTo, assignedToName, scheduledDate, items } = countData

      if (!countType || !zone || !assignedTo || !assignedToName || !scheduledDate || !items) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ success: false, error: "At least one cycle count item is required" }, { status: 400 })
      }

      // Generate count number
      const countNumber = `CC-${String(mockCycleCounts.length + 1).padStart(3, '0')}`

      const newCount: CycleCount = {
        id: (mockCycleCounts.length + 1).toString(),
        countNumber,
        countType,
        status: countData.status || "Scheduled",
        zone,
        assignedTo,
        assignedToName,
        scheduledDate,
        startedAt: countData.startedAt,
        completedAt: countData.completedAt,
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          materialId: item.materialId,
          materialName: item.materialName,
          materialCode: item.materialCode,
          batchNumber: item.batchNumber,
          systemQuantity: Number(item.systemQuantity),
          countedQuantity: Number(item.countedQuantity) || 0,
          variance: Number(item.variance) || 0,
          variancePercentage: Number(item.variancePercentage) || 0,
          status: item.status || "Pending",
          countedBy: item.countedBy,
          countedByName: item.countedByName,
          countedAt: item.countedAt,
          verifiedBy: item.verifiedBy,
          verifiedByName: item.verifiedByName,
          verifiedAt: item.verifiedAt,
          remarks: item.remarks
        })),
        totalItems: items.length,
        countedItems: 0,
        varianceItems: 0,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        remarks: countData.remarks
      }

      mockCycleCounts.push(newCount)

      const response: WarehouseAPIResponse<CycleCount> = {
        success: true,
        data: newCount,
        message: "Cycle count created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create cycle count error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const countData = await request.json()
      const { id, ...updateData } = countData

      const countIndex = mockCycleCounts.findIndex((count) => count.id === id)
      if (countIndex === -1) {
        return Response.json({ success: false, error: "Cycle count not found" }, { status: 404 })
      }

      // Update count
      mockCycleCounts[countIndex] = {
        ...mockCycleCounts[countIndex],
        ...updateData,
      }

      const response: WarehouseAPIResponse<CycleCount> = {
        success: true,
        data: mockCycleCounts[countIndex],
        message: "Cycle count updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update cycle count error:", error)
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
        return Response.json({ success: false, error: "Cycle count ID is required" }, { status: 400 })
      }

      const countIndex = mockCycleCounts.findIndex((count) => count.id === id)
      if (countIndex === -1) {
        return Response.json({ success: false, error: "Cycle count not found" }, { status: 404 })
      }

      const deletedCount = mockCycleCounts.splice(countIndex, 1)[0]

      const response: WarehouseAPIResponse<CycleCount> = {
        success: true,
        data: deletedCount,
        message: "Cycle count deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete cycle count error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
