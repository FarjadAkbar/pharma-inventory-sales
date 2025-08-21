"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/types/auth"
import { useStore } from "@/contexts/store.context"

type ScreenPermission = { screen: string; actions: string[] }

interface UserFormProps {
  initialData?: Partial<User> & { screenPermissions?: ScreenPermission[] }
  onSubmit: (data: {
    name: string
    email: string
    role: "admin" | "store_manager" | "employee"
    assignedStores: string[]
    screenPermissions: ScreenPermission[]
  }) => Promise<void>
  submitLabel?: string
}

export function UserForm({ initialData, onSubmit, submitLabel = "Save" }: UserFormProps) {
  const { stores } = useStore()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: (initialData?.role as any) || ("employee" as const),
    assignedStores: (initialData as any)?.assignedStores || ([] as string[]),
    screenPermissions: (initialData as any)?.screenPermissions || ([] as ScreenPermission[]),
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="store_manager">Store Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Assign Store</Label>
            <Select
              value={formData.assignedStores[0] || ""}
              onValueChange={(value: string) => setFormData((prev) => ({ ...prev, assignedStores: value ? [value] : [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Screen Permissions</Label>
            <div className="space-y-2">
              {[
                "dashboard",
                "products",
                "vendors",
                "categories",
                "sales",
                "pos",
                "users",
                "stores",
              ].map((screen) => {
                const current = (formData.screenPermissions || []).find((sp) => sp.screen === screen)
                const actions = ["view", "create", "edit", "delete"]
                return (
                  <div key={screen} className="flex items-center gap-4">
                    <div className="w-32 capitalize text-sm">{screen}</div>
                    <div className="flex gap-4 text-sm">
                      {actions.map((action) => {
                        const checked = current?.actions.includes(action)
                        return (
                          <label key={action} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!checked}
                              onChange={(e) => {
                                setFormData((prev) => {
                                  const existing = prev.screenPermissions.find((sp) => sp.screen === screen)
                                  let next = [...prev.screenPermissions]
                                  if (!existing) {
                                    next.push({ screen, actions: e.target.checked ? [action] : [] })
                                  } else {
                                    existing.actions = e.target.checked
                                      ? Array.from(new Set([...(existing.actions || []), action]))
                                      : (existing.actions || []).filter((a: string) => a !== action)
                                    next = next.map((sp) => (sp.screen === screen ? existing : sp))
                                  }
                                  return { ...prev, screenPermissions: next }
                                })
                              }}
                            />
                            {action}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


