import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockQCTests } from "@/lib/qc-mock-data"
import { validateText } from "@/lib/validations"
import type { QCTest, QCTestFilters, QCAPIResponse } from "@/types/quality-control"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager", "qa_manager"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const category = searchParams.get("category")
      const isActive = searchParams.get("isActive")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredTests = [...mockQCTests]

      // Apply search filter
      if (search) {
        filteredTests = filteredTests.filter(
          (test) =>
            test.name.toLowerCase().includes(search.toLowerCase()) ||
            test.code.toLowerCase().includes(search.toLowerCase()) ||
            test.description.toLowerCase().includes(search.toLowerCase()) ||
            test.method.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (category) {
        filteredTests = filteredTests.filter((test) => test.category === category)
      }

      if (isActive !== null) {
        const activeFilter = isActive === "true"
        filteredTests = filteredTests.filter((test) => test.isActive === activeFilter)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedTests = filteredTests.slice(startIndex, endIndex)

      const response: QCAPIResponse<{ qcTests: QCTest[]; pagination: any }> = {
        success: true,
        data: {
          qcTests: paginatedTests,
          pagination: {
            page,
            limit,
            total: filteredTests.length,
            totalPages: Math.ceil(filteredTests.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get QC tests error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager"])(request, async (req, user) => {
    try {
      const testData = await request.json()

      // Validation
      const { code, name, description, category, method, specifications } = testData

      if (!code || !name || !description || !category || !method || !specifications) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(code, 2, 20)) {
        return Response.json({ success: false, error: "Code must be between 2 and 20 characters" }, { status: 400 })
      }

      if (!validateText(name, 2, 100)) {
        return Response.json({ success: false, error: "Name must be between 2 and 100 characters" }, { status: 400 })
      }

      // Check if test code already exists
      const existingTest = mockQCTests.find((t) => t.code === code)
      if (existingTest) {
        return Response.json({ success: false, error: "Test with this code already exists" }, { status: 409 })
      }

      const newTest: QCTest = {
        id: (mockQCTests.length + 1).toString(),
        code,
        name,
        description,
        category,
        method,
        specifications: specifications.map((spec: any, index: number) => ({
          id: (index + 1).toString(),
          parameter: spec.parameter,
          minValue: spec.minValue,
          maxValue: spec.maxValue,
          targetValue: spec.targetValue,
          unit: spec.unit,
          criteria: spec.criteria,
          isRequired: spec.isRequired !== false
        })),
        unit: testData.unit || "",
        isActive: testData.isActive !== false,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockQCTests.push(newTest)

      const response: QCAPIResponse<QCTest> = {
        success: true,
        data: newTest,
        message: "QC test created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create QC test error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "qc_manager"])(request, async (req, user) => {
    try {
      const testData = await request.json()
      const { id, ...updateData } = testData

      const testIndex = mockQCTests.findIndex((t) => t.id === id)
      if (testIndex === -1) {
        return Response.json({ success: false, error: "QC test not found" }, { status: 404 })
      }

      // Update test
      mockQCTests[testIndex] = {
        ...mockQCTests[testIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: QCAPIResponse<QCTest> = {
        success: true,
        data: mockQCTests[testIndex],
        message: "QC test updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update QC test error:", error)
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
        return Response.json({ success: false, error: "QC test ID is required" }, { status: 400 })
      }

      const testIndex = mockQCTests.findIndex((t) => t.id === id)
      if (testIndex === -1) {
        return Response.json({ success: false, error: "QC test not found" }, { status: 404 })
      }

      const deletedTest = mockQCTests.splice(testIndex, 1)[0]

      const response: QCAPIResponse<QCTest> = {
        success: true,
        data: deletedTest,
        message: "QC test deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete QC test error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
