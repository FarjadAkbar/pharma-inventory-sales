import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockShipments } from "@/lib/distribution-mock-data"
import { validateText } from "@/lib/validations"
import type { Shipment, ShipmentFilters, DistributionAPIResponse } from "@/types/distribution"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops", "warehouse_ops"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const siteId = searchParams.get("siteId")
      const carrier = searchParams.get("carrier")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const createdBy = searchParams.get("createdBy")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredShipments = [...mockShipments]

      // Apply search filter
      if (search) {
        filteredShipments = filteredShipments.filter(
          (shipment) =>
            shipment.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
            shipment.salesOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
            shipment.accountName.toLowerCase().includes(search.toLowerCase()) ||
            shipment.trackingNumber?.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (status) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.status === status)
      }

      if (priority) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.priority === priority)
      }

      if (siteId) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.siteId === siteId)
      }

      if (carrier) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.carrier === carrier)
      }

      if (dateFrom) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.shipmentDate >= dateFrom)
      }

      if (dateTo) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.shipmentDate <= dateTo)
      }

      if (createdBy) {
        filteredShipments = filteredShipments.filter((shipment) => shipment.createdBy === createdBy)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedShipments = filteredShipments.slice(startIndex, endIndex)

      const response: DistributionAPIResponse<{ shipments: Shipment[]; pagination: any }> = {
        success: true,
        data: {
          shipments: paginatedShipments,
          pagination: {
            page,
            limit,
            total: filteredShipments.length,
            totalPages: Math.ceil(filteredShipments.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get shipments error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops"])(request, async (req, user) => {
    try {
      const shipmentData = await request.json()

      // Validation
      const { salesOrderId, salesOrderNumber, accountId, accountName, siteId, siteName, items, shippingAddress, temperatureRequirements } = shipmentData

      if (!salesOrderId || !salesOrderNumber || !accountId || !accountName || !siteId || !siteName || !items || !shippingAddress || !temperatureRequirements) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(accountName, 2, 100)) {
        return Response.json({ success: false, error: "Account name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ success: false, error: "At least one shipment item is required" }, { status: 400 })
      }

      // Generate shipment number
      const shipmentNumber = `SHIP-${new Date().getFullYear()}-${String(mockShipments.length + 1).padStart(3, '0')}`

      const newShipment: Shipment = {
        id: (mockShipments.length + 1).toString(),
        shipmentNumber,
        salesOrderId,
        salesOrderNumber,
        accountId,
        accountName,
        siteId,
        siteName,
        status: shipmentData.status || "Draft",
        priority: shipmentData.priority || "Normal",
        shipmentDate: shipmentData.shipmentDate || new Date().toISOString(),
        expectedDeliveryDate: shipmentData.expectedDeliveryDate,
        actualDeliveryDate: shipmentData.actualDeliveryDate,
        trackingNumber: shipmentData.trackingNumber,
        carrier: shipmentData.carrier || "Express Logistics",
        serviceType: shipmentData.serviceType || "Standard Delivery",
        packagingInstructions: shipmentData.packagingInstructions || [],
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          drugId: item.drugId,
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchNumber: item.batchNumber,
          quantity: Number(item.quantity),
          unit: item.unit,
          location: item.location,
          pickedQuantity: 0,
          packedQuantity: 0,
          status: "Pending",
          pickedBy: item.pickedBy,
          pickedByName: item.pickedByName,
          pickedAt: item.pickedAt,
          packedBy: item.packedBy,
          packedByName: item.packedByName,
          packedAt: item.packedAt,
          remarks: item.remarks
        })),
        shippingAddress,
        specialHandling: shipmentData.specialHandling || [],
        temperatureRequirements,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        remarks: shipmentData.remarks
      }

      mockShipments.push(newShipment)

      const response: DistributionAPIResponse<Shipment> = {
        success: true,
        data: newShipment,
        message: "Shipment created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create shipment error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops"])(request, async (req, user) => {
    try {
      const shipmentData = await request.json()
      const { id, ...updateData } = shipmentData

      const shipmentIndex = mockShipments.findIndex((shipment) => shipment.id === id)
      if (shipmentIndex === -1) {
        return Response.json({ success: false, error: "Shipment not found" }, { status: 404 })
      }

      // Update shipment
      mockShipments[shipmentIndex] = {
        ...mockShipments[shipmentIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: DistributionAPIResponse<Shipment> = {
        success: true,
        data: mockShipments[shipmentIndex],
        message: "Shipment updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update shipment error:", error)
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
        return Response.json({ success: false, error: "Shipment ID is required" }, { status: 400 })
      }

      const shipmentIndex = mockShipments.findIndex((shipment) => shipment.id === id)
      if (shipmentIndex === -1) {
        return Response.json({ success: false, error: "Shipment not found" }, { status: 404 })
      }

      const deletedShipment = mockShipments.splice(shipmentIndex, 1)[0]

      const response: DistributionAPIResponse<Shipment> = {
        success: true,
        data: deletedShipment,
        message: "Shipment deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete shipment error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
