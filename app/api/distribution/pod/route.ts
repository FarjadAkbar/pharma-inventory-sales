import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockProofOfDeliveries } from "@/lib/distribution-mock-data"
import { validateText } from "@/lib/validations"
import type { ProofOfDelivery, PODFilters, DistributionAPIResponse } from "@/types/distribution"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops", "sales_rep"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const deliveryStatus = searchParams.get("deliveryStatus")
      const accountId = searchParams.get("accountId")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const deliveredBy = searchParams.get("deliveredBy")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredPODs = [...mockProofOfDeliveries]

      // Apply search filter
      if (search) {
        filteredPODs = filteredPODs.filter(
          (pod) =>
            pod.podNumber.toLowerCase().includes(search.toLowerCase()) ||
            pod.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
            pod.salesOrderNumber.toLowerCase().includes(search.toLowerCase()) ||
            pod.accountName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (deliveryStatus) {
        filteredPODs = filteredPODs.filter((pod) => pod.deliveryStatus === deliveryStatus)
      }

      if (accountId) {
        filteredPODs = filteredPODs.filter((pod) => pod.accountId === accountId)
      }

      if (dateFrom) {
        filteredPODs = filteredPODs.filter((pod) => pod.deliveryDate >= dateFrom)
      }

      if (dateTo) {
        filteredPODs = filteredPODs.filter((pod) => pod.deliveryDate <= dateTo)
      }

      if (deliveredBy) {
        filteredPODs = filteredPODs.filter((pod) => pod.deliveredBy === deliveredBy)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedPODs = filteredPODs.slice(startIndex, endIndex)

      const response: DistributionAPIResponse<{ pods: ProofOfDelivery[]; pagination: any }> = {
        success: true,
        data: {
          pods: paginatedPODs,
          pagination: {
            page,
            limit,
            total: filteredPODs.length,
            totalPages: Math.ceil(filteredPODs.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get PODs error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops"])(request, async (req, user) => {
    try {
      const podData = await request.json()

      // Validation
      const { shipmentId, shipmentNumber, salesOrderId, salesOrderNumber, accountId, accountName, deliveryDate, deliveryTime, receivedBy, receivedByName, receivedByTitle } = podData

      if (!shipmentId || !shipmentNumber || !salesOrderId || !salesOrderNumber || !accountId || !accountName || !deliveryDate || !deliveryTime || !receivedBy || !receivedByName || !receivedByTitle) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(accountName, 2, 100)) {
        return Response.json({ success: false, error: "Account name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!validateText(receivedByName, 2, 100)) {
        return Response.json({ success: false, error: "Received by name must be between 2 and 100 characters" }, { status: 400 })
      }

      // Generate POD number
      const podNumber = `POD-${new Date().getFullYear()}-${String(mockProofOfDeliveries.length + 1).padStart(3, '0')}`

      const newPOD: ProofOfDelivery = {
        id: (mockProofOfDeliveries.length + 1).toString(),
        podNumber,
        shipmentId,
        shipmentNumber,
        salesOrderId,
        salesOrderNumber,
        accountId,
        accountName,
        deliveryDate,
        deliveryTime,
        deliveredBy: user.userId.toString(),
        deliveredByName: user.name || "Unknown User",
        receivedBy,
        receivedByName,
        receivedByTitle,
        signature: podData.signature,
        deliveryStatus: podData.deliveryStatus || "Delivered",
        deliveryNotes: podData.deliveryNotes || "",
        photos: podData.photos || [],
        temperatureAtDelivery: Number(podData.temperatureAtDelivery) || 0,
        conditionAtDelivery: podData.conditionAtDelivery || "Good",
        exceptions: podData.exceptions || [],
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        remarks: podData.remarks
      }

      mockProofOfDeliveries.push(newPOD)

      const response: DistributionAPIResponse<ProofOfDelivery> = {
        success: true,
        data: newPOD,
        message: "Proof of delivery created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create POD error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops"])(request, async (req, user) => {
    try {
      const podData = await request.json()
      const { id, ...updateData } = podData

      const podIndex = mockProofOfDeliveries.findIndex((pod) => pod.id === id)
      if (podIndex === -1) {
        return Response.json({ success: false, error: "Proof of delivery not found" }, { status: 404 })
      }

      // Update POD
      mockProofOfDeliveries[podIndex] = {
        ...mockProofOfDeliveries[podIndex],
        ...updateData,
      }

      const response: DistributionAPIResponse<ProofOfDelivery> = {
        success: true,
        data: mockProofOfDeliveries[podIndex],
        message: "Proof of delivery updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update POD error:", error)
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
        return Response.json({ success: false, error: "POD ID is required" }, { status: 400 })
      }

      const podIndex = mockProofOfDeliveries.findIndex((pod) => pod.id === id)
      if (podIndex === -1) {
        return Response.json({ success: false, error: "Proof of delivery not found" }, { status: 404 })
      }

      const deletedPOD = mockProofOfDeliveries.splice(podIndex, 1)[0]

      const response: DistributionAPIResponse<ProofOfDelivery> = {
        success: true,
        data: deletedPOD,
        message: "Proof of delivery deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete POD error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
