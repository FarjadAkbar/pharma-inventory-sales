import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockInventoryItems } from "@/lib/warehouse-mock-data"
import { validateText } from "@/lib/validations"
import type { InventoryItem, InventoryFilters, WarehouseAPIResponse } from "@/types/warehouse"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops", "distribution_ops", "qa_manager", "qc_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const materialId = searchParams.get("materialId")
      const status = searchParams.get("status")
      const zone = searchParams.get("zone")
      const location = searchParams.get("location")
      const expiryDateFrom = searchParams.get("expiryDateFrom")
      const expiryDateTo = searchParams.get("expiryDateTo")
      const temperatureMin = searchParams.get("temperatureMin")
      const temperatureMax = searchParams.get("temperatureMax")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredItems = [...mockInventoryItems]

      // Apply search filter
      if (search) {
        filteredItems = filteredItems.filter(
          (item) =>
            item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
            item.materialName.toLowerCase().includes(search.toLowerCase()) ||
            item.materialCode.toLowerCase().includes(search.toLowerCase()) ||
            item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
            item.location.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (materialId) {
        filteredItems = filteredItems.filter((item) => item.materialId === materialId)
      }

      if (status) {
        filteredItems = filteredItems.filter((item) => item.status === status)
      }

      if (zone) {
        filteredItems = filteredItems.filter((item) => item.zone === zone)
      }

      if (location) {
        filteredItems = filteredItems.filter((item) => item.location === location)
      }

      if (expiryDateFrom) {
        filteredItems = filteredItems.filter((item) => item.expiryDate >= expiryDateFrom)
      }

      if (expiryDateTo) {
        filteredItems = filteredItems.filter((item) => item.expiryDate <= expiryDateTo)
      }

      if (temperatureMin) {
        const tempMin = Number.parseFloat(temperatureMin)
        filteredItems = filteredItems.filter((item) => item.temperature >= tempMin)
      }

      if (temperatureMax) {
        const tempMax = Number.parseFloat(temperatureMax)
        filteredItems = filteredItems.filter((item) => item.temperature <= tempMax)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedItems = filteredItems.slice(startIndex, endIndex)

      const response: WarehouseAPIResponse<{ inventoryItems: InventoryItem[]; pagination: any }> = {
        success: true,
        data: {
          inventoryItems: paginatedItems,
          pagination: {
            page,
            limit,
            total: filteredItems.length,
            totalPages: Math.ceil(filteredItems.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get inventory items error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const itemData = await request.json()

      // Validation
      const { materialId, materialName, materialCode, batchNumber, expiryDate, quantity, unit, location, zone, rack, shelf, position } = itemData

      if (!materialId || !materialName || !materialCode || !batchNumber || !expiryDate || !quantity || !unit || !location) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(materialName, 2, 100)) {
        return Response.json({ success: false, error: "Material name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (quantity <= 0) {
        return Response.json({ success: false, error: "Quantity must be greater than 0" }, { status: 400 })
      }

      // Generate item code
      const itemCode = `INV-${String(mockInventoryItems.length + 1).padStart(3, '0')}`

      const newItem: InventoryItem = {
        id: (mockInventoryItems.length + 1).toString(),
        itemCode,
        materialId,
        materialName,
        materialCode,
        batchNumber,
        expiryDate,
        quantity: Number(quantity),
        unit,
        location,
        zone: zone || "A",
        rack: rack || "01",
        shelf: shelf || "01",
        position: position || "01",
        status: itemData.status || "Available",
        temperature: itemData.temperature || 22.0,
        humidity: itemData.humidity || 55.0,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user.userId.toString(),
        lastUpdatedByName: user.name || "Unknown User",
        remarks: itemData.remarks
      }

      mockInventoryItems.push(newItem)

      const response: WarehouseAPIResponse<InventoryItem> = {
        success: true,
        data: newItem,
        message: "Inventory item created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create inventory item error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "warehouse_ops"])(request, async (req, user) => {
    try {
      const itemData = await request.json()
      const { id, ...updateData } = itemData

      const itemIndex = mockInventoryItems.findIndex((item) => item.id === id)
      if (itemIndex === -1) {
        return Response.json({ success: false, error: "Inventory item not found" }, { status: 404 })
      }

      // Update item
      mockInventoryItems[itemIndex] = {
        ...mockInventoryItems[itemIndex],
        ...updateData,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user.userId.toString(),
        lastUpdatedByName: user.name || "Unknown User",
      }

      const response: WarehouseAPIResponse<InventoryItem> = {
        success: true,
        data: mockInventoryItems[itemIndex],
        message: "Inventory item updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update inventory item error:", error)
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
        return Response.json({ success: false, error: "Inventory item ID is required" }, { status: 400 })
      }

      const itemIndex = mockInventoryItems.findIndex((item) => item.id === id)
      if (itemIndex === -1) {
        return Response.json({ success: false, error: "Inventory item not found" }, { status: 404 })
      }

      const deletedItem = mockInventoryItems.splice(itemIndex, 1)[0]

      const response: WarehouseAPIResponse<InventoryItem> = {
        success: true,
        data: deletedItem,
        message: "Inventory item deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete inventory item error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
