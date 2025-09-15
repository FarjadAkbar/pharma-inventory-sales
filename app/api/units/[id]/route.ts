import { NextRequest, NextResponse } from "next/server"

// Mock database - replace with actual database connection
let units = [
  {
    id: "1",
    name: "Kilogram",
    symbol: "kg",
    description: "Unit of mass",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Liter",
    symbol: "L",
    description: "Unit of volume",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Tablet",
    symbol: "tab",
    description: "Unit for tablets",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Box",
    symbol: "box",
    description: "Unit for packaging",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
]

// GET /api/units/[id] - Get a specific unit
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unit = units.find((u) => u.id === params.id)
    
    if (!unit) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: unit,
      message: "Unit retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching unit:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch unit",
      },
      { status: 500 }
    )
  }
}

// PUT /api/units/[id] - Update a specific unit
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, symbol, description, isActive } = body

    const unitIndex = units.findIndex((u) => u.id === params.id)
    
    if (unitIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit not found",
        },
        { status: 404 }
      )
    }

    // Validation
    if (!name || !symbol) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and symbol are required",
        },
        { status: 400 }
      )
    }

    // Check if unit with same symbol already exists (excluding current unit)
    const existingUnit = units.find(
      (unit) => 
        unit.symbol.toLowerCase() === symbol.toLowerCase() && 
        unit.id !== params.id
    )
    if (existingUnit) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit with this symbol already exists",
        },
        { status: 409 }
      )
    }

    // Update unit
    const updatedUnit = {
      ...units[unitIndex],
      name,
      symbol,
      description: description || "",
      isActive: isActive !== undefined ? isActive : units[unitIndex].isActive,
      updatedAt: new Date().toISOString(),
    }

    units[unitIndex] = updatedUnit

    return NextResponse.json({
      success: true,
      data: updatedUnit,
      message: "Unit updated successfully",
    })
  } catch (error) {
    console.error("Error updating unit:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update unit",
      },
      { status: 500 }
    )
  }
}

// DELETE /api/units/[id] - Delete a specific unit
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const unitIndex = units.findIndex((u) => u.id === params.id)
    
    if (unitIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: "Unit not found",
        },
        { status: 404 }
      )
    }

    // Remove unit
    const deletedUnit = units.splice(unitIndex, 1)[0]

    return NextResponse.json({
      success: true,
      data: deletedUnit,
      message: "Unit deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting unit:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete unit",
      },
      { status: 500 }
    )
  }
}
