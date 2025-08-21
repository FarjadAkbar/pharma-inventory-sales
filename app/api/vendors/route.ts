import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockVendors } from "@/lib/mock-data"
import { validateEmail, validateText } from "@/lib/validations"
import type { Vendor } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredVendors = [...mockVendors]

      // Apply search filter
      if (search) {
        filteredVendors = filteredVendors.filter(
          (vendor) =>
            vendor.name.toLowerCase().includes(search.toLowerCase()) ||
            vendor.email.toLowerCase().includes(search.toLowerCase()) ||
            vendor.contactPerson.toLowerCase().includes(search.toLowerCase()),
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedVendors = filteredVendors.slice(startIndex, endIndex)

      return Response.json({
        success: true,
        data: {
          vendors: paginatedVendors,
          pagination: {
            page,
            limit,
            total: filteredVendors.length,
            pages: Math.ceil(filteredVendors.length / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get vendors error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const vendorData = await request.json()

      // Validation
      const { name, email, phone, address, contactPerson } = vendorData

      if (!name || !email || !contactPerson) {
        return Response.json({ success: false, error: "Name, email, and contact person are required" }, { status: 400 })
      }

      if (!validateText(name, 2, 100)) {
        return Response.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!validateEmail(email)) {
        return Response.json({ success: false, error: "Invalid email format" }, { status: 400 })
      }

      // Check if vendor already exists
      const existingVendor = mockVendors.find((v) => v.email === email)
      if (existingVendor) {
        return Response.json({ success: false, error: "Vendor with this email already exists" }, { status: 409 })
      }

      const newVendor: Vendor = {
        id: (mockVendors.length + 1).toString(),
        name,
        email,
        phone: phone || "",
        address: address || "",
        contactPerson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockVendors.push(newVendor)

      return Response.json({
        success: true,
        data: newVendor,
      })
    } catch (error) {
      console.error("Create vendor error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
