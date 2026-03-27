"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form-hook"
import { warehouseApi, masterDataApi, manufacturingApi } from "@/services"
import { unwrapListResponse } from "@/lib/unwrap-api-list"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface MaterialIssueFormProps {
  initialData?: Partial<MaterialIssue>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

interface MaterialIssue {
  id: number
  issueNumber: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber?: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  workOrderId?: string
  batchId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  requestedBy: number
}

const materialIssueSchema = z.object({
  materialSelection: z.string().min(1, "Please select a material"),
  materialName: z.string(),
  materialCode: z.string(),
  batchNumber: z.string().optional(),
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  unit: z.string().min(1, "Please select a unit"),
  fromLocationId: z.string().optional(),
  toLocationId: z.string().optional(),
  workOrderId: z.string().optional(),
  batchId: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  remarks: z.string().optional(),
  requestedBy: z.coerce.number().min(1),
})

type MaterialIssueFormValues = z.infer<typeof materialIssueSchema>

export function MaterialIssueForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: MaterialIssueFormProps) {
  const [inventoryItems, setInventoryItems] = useState<
    Array<{
      id: number
      itemCode: string
      materialName: string
      materialCode: string
      batchNumber: string
      quantity: number
      unit: string
      locationId?: string
    }>
  >([])
  const [rawMaterials, setRawMaterials] = useState<
    Array<{ id: number; name: string; code: string }>
  >([])
  const [storageLocations, setStorageLocations] = useState<
    Array<{ id: number; locationCode: string; name: string }>
  >([])
  const [workOrders, setWorkOrders] = useState<
    Array<{ id: number; workOrderNumber?: string; orderNumber?: string }>
  >([])
  const [batches, setBatches] = useState<Array<{ id: number; batchNumber?: string }>>([])

  const form = useForm<MaterialIssueFormValues>({
    resolver: zodResolver(materialIssueSchema),
    defaultValues: {
      materialSelection: "",
      materialName: initialData?.materialName || "",
      materialCode: initialData?.materialCode || "",
      batchNumber: initialData?.batchNumber || "",
      quantity: initialData?.quantity ?? 0,
      unit: initialData?.unit || "",
      fromLocationId: initialData?.fromLocationId || "",
      toLocationId: initialData?.toLocationId || "",
      workOrderId: initialData?.workOrderId || "",
      batchId: initialData?.batchId || "",
      referenceId: initialData?.referenceId || "",
      referenceType: initialData?.referenceType || "",
      remarks: initialData?.remarks || "",
      requestedBy: initialData?.requestedBy ?? 1,
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryResponse, rawMaterialsResponse, locationsResponse, workOrdersResponse, batchesResponse] =
          await Promise.all([
            warehouseApi.getInventoryItems({ status: "Available" }),
            masterDataApi.getRawMaterials().catch(() => []),
            warehouseApi.getStorageLocations({ status: "Available" }),
            manufacturingApi.getWorkOrders({ limit: 100 }).catch(() => []),
            manufacturingApi.getBatches({ limit: 100 }).catch(() => []),
          ])

        if (Array.isArray(inventoryResponse)) {
          setInventoryItems(
            inventoryResponse.map((item: Record<string, unknown>) => ({
              id: item.id as number,
              itemCode: String(item.itemCode ?? ""),
              materialName: String(item.materialName ?? ""),
              materialCode: String(item.materialCode ?? ""),
              batchNumber: String(item.batchNumber ?? ""),
              quantity: Number(item.quantity) || 0,
              unit: String(item.unit ?? ""),
              locationId: item.locationId != null ? String(item.locationId) : undefined,
            })),
          )
        }

        const rmList = unwrapListResponse<Record<string, unknown>>(rawMaterialsResponse)
        setRawMaterials(
          rmList.map((rm) => ({
            id: Number(rm.id),
            name: String(rm.name ?? ""),
            code: String(rm.code ?? ""),
          })),
        )

        if (Array.isArray(locationsResponse)) {
          setStorageLocations(
            locationsResponse.map((loc: Record<string, unknown>) => ({
              id: loc.id as number,
              locationCode: String(loc.locationCode ?? ""),
              name: String(loc.name ?? ""),
            })),
          )
        }

        const toArray = (v: unknown): unknown[] => {
          if (Array.isArray(v)) return v
          if (v && typeof v === "object" && "data" in v) {
            const d = (v as { data: unknown }).data
            if (Array.isArray(d)) return d
            if (d && typeof d === "object") {
              const o = d as Record<string, unknown>
              if (Array.isArray(o.workOrders)) return o.workOrders
              if (Array.isArray(o.items)) return o.items
            }
          }
          if (v && typeof v === "object") {
            const o = v as Record<string, unknown>
            if (Array.isArray(o.workOrders)) return o.workOrders
            if (Array.isArray(o.items)) return o.items
          }
          return []
        }

        const woList = toArray(workOrdersResponse)
        setWorkOrders(
          woList.map((wo: { id: number; workOrderNumber?: string; orderNumber?: string }) => ({
            id: wo.id,
            workOrderNumber: wo.workOrderNumber || wo.orderNumber,
            orderNumber: wo.orderNumber,
          })),
        )
        const batchList = toArray(batchesResponse)
        setBatches(
          batchList.map((b: { id: number; batchNumber?: string }) => ({
            id: b.id,
            batchNumber: b.batchNumber,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const materialOptions = [
    ...inventoryItems.map((item) => ({
      value: `inv-${item.id}`,
      label: `${item.itemCode} - ${item.materialName} (Batch: ${item.batchNumber}, Qty: ${item.quantity} ${item.unit})`,
    })),
    ...rawMaterials.map((rm) => ({
      value: String(rm.id),
      label: `${rm.code} - ${rm.name}`,
    })),
  ]

  const locationOptions = storageLocations.map((loc) => ({
    value: loc.locationCode,
    label: `${loc.locationCode} - ${loc.name}`,
  }))

  const applyMaterialSelection = (value: string) => {
    form.setValue("materialSelection", value)
    if (value.startsWith("inv-")) {
      const itemId = parseInt(value.replace("inv-", ""), 10)
      const item = inventoryItems.find((i) => i.id === itemId)
      if (item) {
        form.setValue("materialName", item.materialName)
        form.setValue("materialCode", item.materialCode)
        form.setValue("batchNumber", item.batchNumber)
        form.setValue("quantity", item.quantity)
        form.setValue("unit", item.unit)
        form.setValue("fromLocationId", item.locationId || "")
      }
    } else {
      const materialId = parseInt(value, 10)
      const material = rawMaterials.find((m) => m.id === materialId)
      if (material) {
        form.setValue("materialName", material.name)
        form.setValue("materialCode", material.code)
      }
    }
  }

  const handleFormSubmit = form.handleSubmit(async (values) => {
    try {
      let materialId = 0
      if (values.materialSelection.startsWith("inv-")) {
        materialId = parseInt(values.materialSelection.replace("inv-", ""), 10)
      } else {
        materialId = parseInt(values.materialSelection, 10)
      }

      const issueData: Record<string, unknown> = {
        materialId,
        materialName: values.materialName || undefined,
        materialCode: values.materialCode || undefined,
        batchNumber: values.batchNumber || undefined,
        quantity: values.quantity,
        unit: values.unit,
        fromLocationId: values.fromLocationId || undefined,
        toLocationId: values.toLocationId || undefined,
        workOrderId: values.workOrderId || undefined,
        batchId: values.batchId || undefined,
        referenceId: values.referenceId || undefined,
        referenceType: values.referenceType || undefined,
        remarks: values.remarks || undefined,
        requestedBy: values.requestedBy,
      }

      await onSubmit(issueData)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create material issue"
      form.setError("root", { message: msg })
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Material Issue Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="materialSelection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material *</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(v) => {
                        field.onChange(v)
                        applyMaterialSelection(v)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material or inventory item" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {materialOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled placeholder="Auto-filled" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="materialCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled placeholder="Auto-filled" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter batch number" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={field.value === undefined || field.value === null ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEASUREMENT_UNITS.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Location</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Order</FormLabel>
                    <Select
                      value={field.value ? field.value : "__none__"}
                      onValueChange={(v) => {
                        const next = v === "__none__" ? "" : v
                        field.onChange(next)
                        if (next) {
                          form.setValue("referenceType", "WorkOrder")
                          form.setValue("referenceId", next)
                        } else {
                          form.setValue("referenceId", "")
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None (optional)</SelectItem>
                        {workOrders.map((wo) => (
                          <SelectItem key={wo.id} value={String(wo.id)}>
                            {wo.workOrderNumber || wo.orderNumber || `Work Order #${wo.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <Select
                      value={field.value ? field.value : "__none__"}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None (optional)</SelectItem>
                        {batches.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.batchNumber || `Batch #${b.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Type</FormLabel>
                    <Select
                      value={field.value ? field.value : "__none__"}
                      onValueChange={(v) => field.onChange(v === "__none__" ? "" : v)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        <SelectItem value="WorkOrder">Work Order</SelectItem>
                        <SelectItem value="ProductionOrder">Production Order</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="referenceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Reference ID" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} placeholder="Additional notes" />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
