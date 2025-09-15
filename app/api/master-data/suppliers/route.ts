import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockSuppliers } from "@/lib/pharma-mock-data"
import { validateText, validateEmail } from "@/lib/validations"
import type { Supplier, SupplierFilters, PharmaApiResponse } from "@/types/pharma"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const rating = searchParams.get("rating")
      const isActive = searchParams.get("isActive")
      const performance = searchParams.get("performance")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredSuppliers = [...mockSuppliers]

      // Apply search filter
      if (search) {
        filteredSuppliers = filteredSuppliers.filter(
          (supplier) =>
            supplier.name.toLowerCase().includes(search.toLowerCase()) ||
            supplier.code.toLowerCase().includes(search.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
            supplier.email.toLowerCase().includes(search.toLowerCase()) ||
            supplier.address.city.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (rating) {
        const minRating = Number(rating)
        filteredSuppliers = filteredSuppliers.filter((supplier) => supplier.rating >= minRating)
      }

      if (isActive !== null) {
        const activeFilter = isActive === "true"
        filteredSuppliers = filteredSuppliers.filter((supplier) => supplier.isActive === activeFilter)
      }

      if (performance) {
        filteredSuppliers = filteredSuppliers.filter((supplier) => {
          const { onTimeDelivery, qualityScore } = supplier.performance
          switch (performance) {
            case "excellent":
              return onTimeDelivery >= 95 && qualityScore >= 4.5
            case "good":
              return onTimeDelivery >= 85 && qualityScore >= 4.0
            case "average":
              return onTimeDelivery >= 70 && qualityScore >= 3.0
            case "poor":
              return onTimeDelivery < 70 || qualityScore < 3.0
            default:
              return true
          }
        })
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedSuppliers = filteredSuppliers.slice(startIndex, endIndex)

      const response: PharmaApiResponse<{ suppliers: Supplier[]; pagination: any }> = {
        success: true,
        data: {
          suppliers: paginatedSuppliers,
          pagination: {
            page,
            limit,
            total: filteredSuppliers.length,
            totalPages: Math.ceil(filteredSuppliers.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get suppliers error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const supplierData = await request.json()

      // Validation
      const { code, name, contactPerson, email, phone, address } = supplierData

      if (!code || !name || !contactPerson || !email || !phone || !address) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(code, 2, 20)) {
        return Response.json({ success: false, error: "Code must be between 2 and 20 characters" }, { status: 400 })
      }

      if (!validateText(name, 2, 100)) {
        return Response.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!validateEmail(email)) {
        return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
      }

      // Check if supplier code already exists
      const existingSupplier = mockSuppliers.find((s) => s.code === code)
      if (existingSupplier) {
        return Response.json({ success: false, error: "Supplier with this code already exists" }, { status: 409 })
      }

      const newSupplier: Supplier = {
        id: (mockSuppliers.length + 1).toString(),
        code,
        name,
        contactPerson,
        email,
        phone,
        address,
        rating: supplierData.rating || 0,
        performance: supplierData.performance || {
          onTimeDelivery: 0,
          qualityScore: 0,
          responseTime: 0,
          totalOrders: 0,
          successfulOrders: 0,
        },
        certifications: supplierData.certifications || [],
        paymentTerms: supplierData.paymentTerms || "Net 30",
        deliveryTime: supplierData.deliveryTime || 7,
        isActive: supplierData.isActive !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId.toString(),
      }

      mockSuppliers.push(newSupplier)

      const response: PharmaApiResponse<Supplier> = {
        success: true,
        data: newSupplier,
        message: "Supplier created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create supplier error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "procurement_manager"])(request, async (req, user) => {
    try {
      const supplierData = await request.json()
      const { id, ...updateData } = supplierData

      const supplierIndex = mockSuppliers.findIndex((s) => s.id === id)
      if (supplierIndex === -1) {
        return Response.json({ success: false, error: "Supplier not found" }, { status: 404 })
      }

      // Update supplier
      mockSuppliers[supplierIndex] = {
        ...mockSuppliers[supplierIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: PharmaApiResponse<Supplier> = {
        success: true,
        data: mockSuppliers[supplierIndex],
        message: "Supplier updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update supplier error:", error)
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
        return Response.json({ success: false, error: "Supplier ID is required" }, { status: 400 })
      }

      const supplierIndex = mockSuppliers.findIndex((s) => s.id === id)
      if (supplierIndex === -1) {
        return Response.json({ success: false, error: "Supplier not found" }, { status: 404 })
      }

      const deletedSupplier = mockSuppliers.splice(supplierIndex, 1)[0]

      const response: PharmaApiResponse<Supplier> = {
        success: true,
        data: deletedSupplier,
        message: "Supplier deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete supplier error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
