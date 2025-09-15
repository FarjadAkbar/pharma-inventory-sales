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

// GET /api/units - List all units
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const status = searchParams.get("status")

    let filteredUnits = [...units]

    // Apply search filter
    if (search) {
      filteredUnits = filteredUnits.filter(
        (unit) =>
          unit.name.toLowerCase().includes(search.toLowerCase()) ||
          unit.symbol.toLowerCase().includes(search.toLowerCase()) ||
          unit.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Apply status filter
    if (status) {
      filteredUnits = filteredUnits.filter(
        (unit) => unit.isActive === (status === "active")
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredUnits,
      message: "Units retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching units:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch units",
      },
      { status: 500 }
    )
  }
}

// POST /api/units - Create a new unit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, symbol, description, isActive = true } = body

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

    // Check if unit with same symbol already exists
    const existingUnit = units.find(
      (unit) => unit.symbol.toLowerCase() === symbol.toLowerCase()
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

    // Create new unit
    const newUnit = {
      id: (units.length + 1).toString(),
      name,
      symbol,
      description: description || "",
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    units.push(newUnit)

    return NextResponse.json(
      {
        success: true,
        data: newUnit,
        message: "Unit created successfully",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating unit:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create unit",
      },
      { status: 500 }
    )
  }
}
