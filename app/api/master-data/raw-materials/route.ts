import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockRawMaterials } from "@/lib/pharma-mock-data"
import { validateText } from "@/lib/validations"
import type { RawMaterial, RawMaterialFilters, PharmaApiResponse } from "@/types/pharma"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "production_manager", "warehouse_ops"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const grade = searchParams.get("grade")
      const supplierId = searchParams.get("supplierId")
      const isActive = searchParams.get("isActive")
      const lowStock = searchParams.get("lowStock")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredMaterials = [...mockRawMaterials]

      // Apply search filter
      if (search) {
        filteredMaterials = filteredMaterials.filter(
          (material) =>
            material.name.toLowerCase().includes(search.toLowerCase()) ||
            material.code.toLowerCase().includes(search.toLowerCase()) ||
            material.specification.toLowerCase().includes(search.toLowerCase()) ||
            material.supplierName.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (grade) {
        filteredMaterials = filteredMaterials.filter((material) => material.grade === grade)
      }

      if (supplierId) {
        filteredMaterials = filteredMaterials.filter((material) => material.supplierId === supplierId)
      }

      if (isActive !== null) {
        const activeFilter = isActive === "true"
        filteredMaterials = filteredMaterials.filter((material) => material.isActive === activeFilter)
      }

      if (lowStock === "true") {
        filteredMaterials = filteredMaterials.filter((material) => material.currentStock <= material.reorderLevel)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedMaterials = filteredMaterials.slice(startIndex, endIndex)

      const response: PharmaApiResponse<{ rawMaterials: RawMaterial[]; pagination: any }> = {
        success: true,
        data: {
          rawMaterials: paginatedMaterials,
          pagination: {
            page,
            limit,
            total: filteredMaterials.length,
            totalPages: Math.ceil(filteredMaterials.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get raw materials error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const materialData = await request.json()

      // Validation
      const { code, name, grade, specification, unitOfMeasure, supplierId, costPerUnit } = materialData

      if (!code || !name || !grade || !specification || !unitOfMeasure || !supplierId || !costPerUnit) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(code, 2, 20)) {
        return Response.json({ success: false, error: "Code must be between 2 and 20 characters" }, { status: 400 })
      }

      if (!validateText(name, 2, 100)) {
        return Response.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 })
      }

      // Check if material code already exists
      const existingMaterial = mockRawMaterials.find((m) => m.code === code)
      if (existingMaterial) {
        return Response.json({ success: false, error: "Raw material with this code already exists" }, { status: 409 })
      }

      const newMaterial: RawMaterial = {
        id: (mockRawMaterials.length + 1).toString(),
        code,
        name,
        grade,
        specification,
        unitOfMeasure,
        supplierId,
        supplierName: materialData.supplierName || "Unknown Supplier",
        storageRequirements: materialData.storageRequirements || [],
        shelfLife: materialData.shelfLife,
        minOrderQuantity: materialData.minOrderQuantity || 1,
        maxOrderQuantity: materialData.maxOrderQuantity,
        currentStock: materialData.currentStock || 0,
        reorderLevel: materialData.reorderLevel || 10,
        costPerUnit: Number(costPerUnit),
        isActive: materialData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId.toString(),
      }

      mockRawMaterials.push(newMaterial)

      const response: PharmaApiResponse<RawMaterial> = {
        success: true,
        data: newMaterial,
        message: "Raw material created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create raw material error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const materialData = await request.json()
      const { id, ...updateData } = materialData

      const materialIndex = mockRawMaterials.findIndex((m) => m.id === id)
      if (materialIndex === -1) {
        return Response.json({ success: false, error: "Raw material not found" }, { status: 404 })
      }

      // Update material
      mockRawMaterials[materialIndex] = {
        ...mockRawMaterials[materialIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: PharmaApiResponse<RawMaterial> = {
        success: true,
        data: mockRawMaterials[materialIndex],
        message: "Raw material updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update raw material error:", error)
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
        return Response.json({ success: false, error: "Raw material ID is required" }, { status: 400 })
      }

      const materialIndex = mockRawMaterials.findIndex((m) => m.id === id)
      if (materialIndex === -1) {
        return Response.json({ success: false, error: "Raw material not found" }, { status: 404 })
      }

      const deletedMaterial = mockRawMaterials.splice(materialIndex, 1)[0]

      const response: PharmaApiResponse<RawMaterial> = {
        success: true,
        data: deletedMaterial,
        message: "Raw material deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete raw material error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
