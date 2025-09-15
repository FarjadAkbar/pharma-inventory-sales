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

// GET /api/equipment/[id] - Get a specific equipment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = equipment.find((e) => e.id === params.id)
    
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Equipment not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: item,
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

// PUT /api/equipment/[id] - Update a specific equipment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, code, type, location, status, lastMaintenance, nextMaintenance, isActive } = body

    const itemIndex = equipment.findIndex((e) => e.id === params.id)
    
    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Equipment not found",
        },
        { status: 404 }
      )
    }

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

    // Check if equipment with same code already exists (excluding current equipment)
    const existingEquipment = equipment.find(
      (item) => 
        item.code.toLowerCase() === code.toLowerCase() && 
        item.id !== params.id
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

    // Update equipment
    const updatedEquipment = {
      ...equipment[itemIndex],
      name,
      code,
      type,
      location,
      status: status || equipment[itemIndex].status,
      lastMaintenance: lastMaintenance || equipment[itemIndex].lastMaintenance,
      nextMaintenance: nextMaintenance || equipment[itemIndex].nextMaintenance,
      isActive: isActive !== undefined ? isActive : equipment[itemIndex].isActive,
      updatedAt: new Date().toISOString(),
    }

    equipment[itemIndex] = updatedEquipment

    return NextResponse.json({
      success: true,
      data: updatedEquipment,
      message: "Equipment updated successfully",
    })
  } catch (error) {
    console.error("Error updating equipment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update equipment",
      },
      { status: 500 }
    )
  }
}

// DELETE /api/equipment/[id] - Delete a specific equipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemIndex = equipment.findIndex((e) => e.id === params.id)
    
    if (itemIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Equipment not found",
        },
        { status: 404 }
      )
    }

    // Remove equipment
    const deletedEquipment = equipment.splice(itemIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedEquipment,
      message: "Equipment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting equipment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete equipment",
      },
      { status: 500 }
    )
  }
}
