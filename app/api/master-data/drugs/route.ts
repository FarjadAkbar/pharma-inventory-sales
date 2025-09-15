import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockDrugs } from "@/lib/pharma-mock-data"
import { validateText, validateEmail } from "@/lib/validations"
import type { Drug, DrugFilters, PharmaApiResponse } from "@/types/pharma"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager", "production_manager", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const dosageForm = searchParams.get("dosageForm")
      const route = searchParams.get("route")
      const approvalStatus = searchParams.get("approvalStatus")
      const therapeuticClass = searchParams.get("therapeuticClass")
      const manufacturer = searchParams.get("manufacturer")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredDrugs = [...mockDrugs]

      // Apply search filter
      if (search) {
        filteredDrugs = filteredDrugs.filter(
          (drug) =>
            drug.name.toLowerCase().includes(search.toLowerCase()) ||
            drug.code.toLowerCase().includes(search.toLowerCase()) ||
            drug.formula.toLowerCase().includes(search.toLowerCase()) ||
            drug.description.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (dosageForm) {
        filteredDrugs = filteredDrugs.filter((drug) => drug.dosageForm === dosageForm)
      }

      if (route) {
        filteredDrugs = filteredDrugs.filter((drug) => drug.route === route)
      }

      if (approvalStatus) {
        filteredDrugs = filteredDrugs.filter((drug) => drug.approvalStatus === approvalStatus)
      }

      if (therapeuticClass) {
        filteredDrugs = filteredDrugs.filter((drug) => 
          drug.therapeuticClass?.toLowerCase().includes(therapeuticClass.toLowerCase())
        )
      }

      if (manufacturer) {
        filteredDrugs = filteredDrugs.filter((drug) => 
          drug.manufacturer?.toLowerCase().includes(manufacturer.toLowerCase())
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedDrugs = filteredDrugs.slice(startIndex, endIndex)

      const response: PharmaApiResponse<{ drugs: Drug[]; pagination: any }> = {
        success: true,
        data: {
          drugs: paginatedDrugs,
          pagination: {
            page,
            limit,
            total: filteredDrugs.length,
            totalPages: Math.ceil(filteredDrugs.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get drugs error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const drugData = await request.json()

      // Validation
      const { code, name, formula, strength, dosageForm, route, description } = drugData

      if (!code || !name || !formula || !strength || !dosageForm || !route || !description) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(code, 2, 20)) {
        return Response.json({ success: false, error: "Code must be between 2 and 20 characters" }, { status: 400 })
      }

      if (!validateText(name, 2, 100)) {
        return Response.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!validateText(formula, 1, 50)) {
        return Response.json({ success: false, error: "Formula must be between 1 and 50 characters" }, { status: 400 })
      }

      // Check if drug code already exists
      const existingDrug = mockDrugs.find((d) => d.code === code)
      if (existingDrug) {
        return Response.json({ success: false, error: "Drug with this code already exists" }, { status: 409 })
      }

      const newDrug: Drug = {
        id: (mockDrugs.length + 1).toString(),
        code,
        name,
        formula,
        strength,
        dosageForm,
        route,
        description,
        approvalStatus: drugData.approvalStatus || "Draft",
        therapeuticClass: drugData.therapeuticClass,
        manufacturer: drugData.manufacturer,
        registrationNumber: drugData.registrationNumber,
        expiryDate: drugData.expiryDate,
        storageConditions: drugData.storageConditions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId.toString(),
      }

      mockDrugs.push(newDrug)

      const response: PharmaApiResponse<Drug> = {
        success: true,
        data: newDrug,
        message: "Drug created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create drug error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const drugData = await request.json()
      const { id, ...updateData } = drugData

      const drugIndex = mockDrugs.findIndex((d) => d.id === id)
      if (drugIndex === -1) {
        return Response.json({ success: false, error: "Drug not found" }, { status: 404 })
      }

      // Update drug
      mockDrugs[drugIndex] = {
        ...mockDrugs[drugIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: PharmaApiResponse<Drug> = {
        success: true,
        data: mockDrugs[drugIndex],
        message: "Drug updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update drug error:", error)
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
        return Response.json({ success: false, error: "Drug ID is required" }, { status: 400 })
      }

      const drugIndex = mockDrugs.findIndex((d) => d.id === id)
      if (drugIndex === -1) {
        return Response.json({ success: false, error: "Drug not found" }, { status: 404 })
      }

      const deletedDrug = mockDrugs.splice(drugIndex, 1)[0]

      const response: PharmaApiResponse<Drug> = {
        success: true,
        data: deletedDrug,
        message: "Drug deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete drug error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
