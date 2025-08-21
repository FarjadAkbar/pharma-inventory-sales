import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockUsers } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  return requireAuth(["admin", "store_manager"])(request, async (req, user) => {
    const u = mockUsers.find((x) => x.id === params.id)
    if (!u) return Response.json({ success: false, error: "User not found" }, { status: 404 })

    if (user.role === "store_manager") {
      // ensure target user overlaps within manager stores and is not admin/manager
      if (u.role === "admin" || u.role === "store_manager") {
        return Response.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
      }
      const managerStores = (user as any).assignedStores || []
      const userStores = (u as any).assignedStores || []
      const overlap = userStores.some((sid: string) => managerStores.includes(sid))
      if (!overlap) return Response.json({ success: false, error: "User not in your stores" }, { status: 403 })
    }

    return Response.json({ success: true, data: u })
  })
}


