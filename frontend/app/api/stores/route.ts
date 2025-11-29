import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockStores } from "@/lib/mock-data"
import type { Store } from "@/types/tenant"

export async function GET(request: NextRequest) {
  return requireAuth()(request, async (_req, user) => {
    const data = (user.role === "admin" || user.role === "client_admin") ? mockStores : mockStores.filter((s) => (user as any).assignedStores?.includes(s.id))
    return Response.json({ success: true, data })
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["admin", "client_admin"])(request, async (_req, user) => {
    const body = await request.json()
    const { name, city, address, image } = body || {}
    if (!name || !city || !address) {
      return Response.json({ success: false, error: "name, city, address are required" }, { status: 400 })
    }
    const newStore: Store = {
      id: `store-${mockStores.length + 1}`,
      name,
      city,
      address,
      image,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockStores.push(newStore)
    return Response.json({ success: true, data: newStore })
  })
}


