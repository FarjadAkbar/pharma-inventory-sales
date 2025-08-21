import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockVendors } from "@/lib/mock-data"
import { validateEmail, validateText } from "@/lib/validations"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const vendorData = await request.json()
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

      const vendorIndex = mockVendors.findIndex((v) => v.id === params.id)
      if (vendorIndex === -1) {
        return Response.json({ success: false, error: "Vendor not found" }, { status: 404 })
      }

      // Check if another vendor with the same email exists
      const existingVendor = mockVendors.find((v) => v.email === email && v.id !== params.id)
      if (existingVendor) {
        return Response.json({ success: false, error: "Vendor with this email already exists" }, { status: 409 })
      }

      mockVendors[vendorIndex] = {
        ...mockVendors[vendorIndex],
        name,
        email,
        phone: phone || "",
        address: address || "",
        contactPerson,
        updatedAt: new Date().toISOString(),
      }

      return Response.json({
        success: true,
        data: mockVendors[vendorIndex],
      })
    } catch (error) {
      console.error("Update vendor error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "manager"])(request, async (req, user) => {
    try {
      const vendorIndex = mockVendors.findIndex((v) => v.id === params.id)
      if (vendorIndex === -1) {
        return Response.json({ success: false, error: "Vendor not found" }, { status: 404 })
      }

      const deletedVendor = mockVendors.splice(vendorIndex, 1)[0]

      return Response.json({
        success: true,
        data: deletedVendor,
      })
    } catch (error) {
      console.error("Delete vendor error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
