import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockStores } from "@/lib/mock-data"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin"])(request, async (_req) => {
    const idx = mockStores.findIndex((s) => s.id === params.id)
    if (idx === -1) return Response.json({ success: false, error: "Store not found" }, { status: 404 })
    const body = await request.json()
    mockStores[idx] = { ...mockStores[idx], ...body, id: mockStores[idx].id, updatedAt: new Date().toISOString() }
    return Response.json({ success: true, data: mockStores[idx] })
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin"])(request, async (_req) => {
    const idx = mockStores.findIndex((s) => s.id === params.id)
    if (idx === -1) return Response.json({ success: false, error: "Store not found" }, { status: 404 })
    const removed = mockStores.splice(idx, 1)[0]
    return Response.json({ success: true, data: removed })
  })
}


