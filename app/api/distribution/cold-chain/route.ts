import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockColdChainRecords, mockTemperatureExcursions } from "@/lib/distribution-mock-data"
import type { ColdChainRecord, TemperatureExcursion, DistributionAPIResponse } from "@/types/distribution"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get("type") || "records"
      const search = searchParams.get("search")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      if (type === "records") {
        let filteredRecords = [...mockColdChainRecords]

        // Apply search filter
        if (search) {
          filteredRecords = filteredRecords.filter(
            (record) =>
              record.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
              record.drugName.toLowerCase().includes(search.toLowerCase()) ||
              record.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
              record.location.toLowerCase().includes(search.toLowerCase())
          )
        }

        // Apply pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

        const response: DistributionAPIResponse<{ records: ColdChainRecord[]; pagination: any }> = {
          success: true,
          data: {
            records: paginatedRecords,
            pagination: {
              page,
              limit,
              total: filteredRecords.length,
              totalPages: Math.ceil(filteredRecords.length / limit),
            },
          },
        }

        return Response.json(response)
      } else if (type === "excursions") {
        let filteredExcursions = [...mockTemperatureExcursions]

        // Apply search filter
        if (search) {
          filteredExcursions = filteredExcursions.filter(
            (excursion) =>
              excursion.excursionNumber.toLowerCase().includes(search.toLowerCase()) ||
              excursion.shipmentNumber.toLowerCase().includes(search.toLowerCase()) ||
              excursion.drugName.toLowerCase().includes(search.toLowerCase()) ||
              excursion.batchNumber.toLowerCase().includes(search.toLowerCase())
          )
        }

        // Apply pagination
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedExcursions = filteredExcursions.slice(startIndex, endIndex)

        const response: DistributionAPIResponse<{ excursions: TemperatureExcursion[]; pagination: any }> = {
          success: true,
          data: {
            excursions: paginatedExcursions,
            pagination: {
              page,
              limit,
              total: filteredExcursions.length,
              totalPages: Math.ceil(filteredExcursions.length / limit),
            },
          },
        }

        return Response.json(response)
      }

      return Response.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    } catch (error) {
      console.error("Get cold chain data error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops"])(request, async (req, user) => {
    try {
      const data = await request.json()
      const { type, ...recordData } = data

      if (type === "record") {
        const newRecord: ColdChainRecord = {
          id: (mockColdChainRecords.length + 1).toString(),
          shipmentId: recordData.shipmentId,
          shipmentNumber: recordData.shipmentNumber,
          drugId: recordData.drugId,
          drugName: recordData.drugName,
          batchNumber: recordData.batchNumber,
          temperature: Number(recordData.temperature),
          humidity: Number(recordData.humidity),
          location: recordData.location,
          timestamp: recordData.timestamp || new Date().toISOString(),
          sensorId: recordData.sensorId,
          status: recordData.status || "Normal",
          remarks: recordData.remarks
        }

        mockColdChainRecords.push(newRecord)

        const response: DistributionAPIResponse<ColdChainRecord> = {
          success: true,
          data: newRecord,
          message: "Cold chain record created successfully",
        }

        return Response.json(response)
      } else if (type === "excursion") {
        const newExcursion: TemperatureExcursion = {
          id: (mockTemperatureExcursions.length + 1).toString(),
          excursionNumber: `TEMP-EXC-${String(mockTemperatureExcursions.length + 1).padStart(3, '0')}`,
          shipmentId: recordData.shipmentId,
          shipmentNumber: recordData.shipmentNumber,
          drugId: recordData.drugId,
          drugName: recordData.drugName,
          batchNumber: recordData.batchNumber,
          severity: recordData.severity || "Medium",
          status: recordData.status || "Active",
          minTemperature: Number(recordData.minTemperature),
          maxTemperature: Number(recordData.maxTemperature),
          actualTemperature: Number(recordData.actualTemperature),
          duration: Number(recordData.duration),
          unit: recordData.unit || "°C",
          detectedAt: recordData.detectedAt || new Date().toISOString(),
          acknowledgedBy: recordData.acknowledgedBy,
          acknowledgedByName: recordData.acknowledgedByName,
          acknowledgedAt: recordData.acknowledgedAt,
          resolvedBy: recordData.resolvedBy,
          resolvedByName: recordData.resolvedByName,
          resolvedAt: recordData.resolvedAt,
          correctiveActions: recordData.correctiveActions || [],
          remarks: recordData.remarks
        }

        mockTemperatureExcursions.push(newExcursion)

        const response: DistributionAPIResponse<TemperatureExcursion> = {
          success: true,
          data: newExcursion,
          message: "Temperature excursion created successfully",
        }

        return Response.json(response)
      }

      return Response.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    } catch (error) {
      console.error("Create cold chain data error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "distribution_ops", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const data = await request.json()
      const { type, id, ...updateData } = data

      if (type === "record") {
        const recordIndex = mockColdChainRecords.findIndex((record) => record.id === id)
        if (recordIndex === -1) {
          return Response.json({ success: false, error: "Cold chain record not found" }, { status: 404 })
        }

        mockColdChainRecords[recordIndex] = {
          ...mockColdChainRecords[recordIndex],
          ...updateData,
        }

        const response: DistributionAPIResponse<ColdChainRecord> = {
          success: true,
          data: mockColdChainRecords[recordIndex],
          message: "Cold chain record updated successfully",
        }

        return Response.json(response)
      } else if (type === "excursion") {
        const excursionIndex = mockTemperatureExcursions.findIndex((excursion) => excursion.id === id)
        if (excursionIndex === -1) {
          return Response.json({ success: false, error: "Temperature excursion not found" }, { status: 404 })
        }

        mockTemperatureExcursions[excursionIndex] = {
          ...mockTemperatureExcursions[excursionIndex],
          ...updateData,
        }

        const response: DistributionAPIResponse<TemperatureExcursion> = {
          success: true,
          data: mockTemperatureExcursions[excursionIndex],
          message: "Temperature excursion updated successfully",
        }

        return Response.json(response)
      }

      return Response.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    } catch (error) {
      console.error("Update cold chain data error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const type = searchParams.get("type")
      const id = searchParams.get("id")

      if (!type || !id) {
        return Response.json({ success: false, error: "Type and ID are required" }, { status: 400 })
      }

      if (type === "record") {
        const recordIndex = mockColdChainRecords.findIndex((record) => record.id === id)
        if (recordIndex === -1) {
          return Response.json({ success: false, error: "Cold chain record not found" }, { status: 404 })
        }

        const deletedRecord = mockColdChainRecords.splice(recordIndex, 1)[0]

        const response: DistributionAPIResponse<ColdChainRecord> = {
          success: true,
          data: deletedRecord,
          message: "Cold chain record deleted successfully",
        }

        return Response.json(response)
      } else if (type === "excursion") {
        const excursionIndex = mockTemperatureExcursions.findIndex((excursion) => excursion.id === id)
        if (excursionIndex === -1) {
          return Response.json({ success: false, error: "Temperature excursion not found" }, { status: 404 })
        }

        const deletedExcursion = mockTemperatureExcursions.splice(excursionIndex, 1)[0]

        const response: DistributionAPIResponse<TemperatureExcursion> = {
          success: true,
          data: deletedExcursion,
          message: "Temperature excursion deleted successfully",
        }

        return Response.json(response)
      }

      return Response.json({ success: false, error: "Invalid type parameter" }, { status: 400 })
    } catch (error) {
      console.error("Delete cold chain data error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
