import { NextRequest, NextResponse } from "next/server"

// Mock database - replace with actual database connection
let equipment = [
  {
    id: "1",
    name: "Tablet Press Machine",
    code: "TPM-001",
    type: "Manufacturing",
    location: "Production Hall A",
    status: "operational",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Coating Machine",
    code: "CM-002",
    type: "Manufacturing",
    location: "Production Hall B",
    status: "maintenance",
    lastMaintenance: "2024-02-01",
    nextMaintenance: "2024-05-01",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Packaging Line",
    code: "PL-003",
    type: "Packaging",
    location: "Packaging Area",
    status: "operational",
    lastMaintenance: "2024-01-20",
    nextMaintenance: "2024-04-20",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Quality Control Equipment",
    code: "QC-004",
    type: "Testing",
    location: "QC Lab",
    status: "operational",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

// GET /api/equipment - List all equipment
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    let filteredEquipment = [...equipment]

    // Apply search filter
    if (search) {
      filteredEquipment = filteredEquipment.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.code.toLowerCase().includes(search.toLowerCase()) ||
          item.type.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply type filter
    if (type) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.type.toLowerCase() === type.toLowerCase()
      )
    }

    // Apply status filter
    if (status) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.status === status
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredEquipment,
      message: "Equipment retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching equipment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch equipment",
      },
      { status: 500 }
    )
  }
}

// POST /api/equipment - Create a new equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, type, location, status, lastMaintenance, nextMaintenance, isActive = true } = body

    // Validation
    if (!name || !code || !type || !location) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, code, type, and location are required",
        },
        { status: 400 }
      )
    }

    // Check if equipment with same code already exists
    const existingEquipment = equipment.find(
      (item) => item.code.toLowerCase() === code.toLowerCase()
    )
    if (existingEquipment) {
      return NextResponse.json(
        {
          success: false,
          error: "Equipment with this code already exists",
        },
        { status: 409 }
      )
    }

    // Create new equipment
    const newEquipment = {
      id: (equipment.length + 1).toString(),
      name,
      code,
      type,
      location,
      status: status || "operational",
      lastMaintenance: lastMaintenance || new Date().toISOString(),
      nextMaintenance: nextMaintenance || new Date().toISOString(),
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    equipment.push(newEquipment)

    return NextResponse.json(
      {
        success: true,
        data: newEquipment,
        message: "Equipment created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating equipment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create equipment",
      },
      { status: 500 }
    )
  }
}
