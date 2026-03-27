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
import { warehouseApi, masterDataApi } from "@/services"
import { unwrapListResponse } from "@/lib/unwrap-api-list"
import { MEASUREMENT_UNITS } from "@/lib/constants/units"

interface StockMovementFormProps {
  initialData?: Partial<StockMovement>
  fromItemId?: number
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

interface StockMovement {
  id: number
  movementNumber: string
  movementType: string
  materialId: number
  materialName: string
  materialCode: string
  batchNumber: string
  quantity: number
  unit: string
  fromLocationId?: string
  toLocationId?: string
  referenceId?: string
  referenceType?: string
  remarks?: string
  performedBy?: number
  performedAt?: string
}

const stockMovementSchema = z
  .object({
    movementType: z.string().min(1, "Please select a movement type"),
    materialSelection: z.string().min(1, "Please select a material"),
    materialName: z.string(),
    materialCode: z.string(),
    batchNumber: z.string().optional(),
    quantity: z.coerce.number().positive("Enter a valid quantity"),
    unit: z.string().min(1, "Please select a unit"),
    fromLocationId: z.string().optional(),
    toLocationId: z.string().optional(),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
    remarks: z.string().optional(),
    performedBy: z.coerce.number().min(1),
  })
  .superRefine((data, ctx) => {
    const t = data.movementType
    if (t === "Transfer" && !data.fromLocationId && !data.toLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transfer movements require from and/or to location",
        path: ["fromLocationId"],
      })
    }
    if (t === "Receipt" && !data.toLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Receipt movements require a destination location",
        path: ["toLocationId"],
      })
    }
    if (t === "Consumption" && !data.fromLocationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Consumption movements require a source location",
        path: ["fromLocationId"],
      })
    }
  })

type StockMovementFormValues = z.infer<typeof stockMovementSchema>

export function StockMovementForm({
  initialData,
  fromItemId,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: StockMovementFormProps) {
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

  const form = useForm<StockMovementFormValues>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      movementType: initialData?.movementType || "Transfer",
      materialSelection: "",
      materialName: initialData?.materialName || "",
      materialCode: initialData?.materialCode || "",
      batchNumber: initialData?.batchNumber || "",
      quantity: initialData?.quantity ?? 0,
      unit: initialData?.unit || "",
      fromLocationId: initialData?.fromLocationId || "",
      toLocationId: initialData?.toLocationId || "",
      referenceId: initialData?.referenceId || "",
      referenceType: initialData?.referenceType || "",
      remarks: initialData?.remarks || "",
      performedBy: initialData?.performedBy ?? 1,
    },
    mode: "onSubmit",
  })

  const movementType = form.watch("movementType")

  useEffect(() => {
    const load = async () => {
      try {
        const [inventoryResponse, rawMaterialsResponse, locationsResponse] = await Promise.all([
          warehouseApi.getInventoryItems({ status: "Available" }),
          masterDataApi.getRawMaterials().catch(() => []),
          warehouseApi.getStorageLocations({ status: "Available" }),
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
      } catch (e) {
        console.error("Failed to fetch data:", e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!fromItemId) return
    const run = async () => {
      try {
        const item = await warehouseApi.getInventoryItem(fromItemId.toString())
        if (item) {
          form.setValue("materialSelection", `inv-${item.id}`)
          form.setValue("materialName", item.materialName)
          form.setValue("materialCode", item.materialCode)
          form.setValue("batchNumber", item.batchNumber)
          form.setValue("quantity", item.quantity)
          form.setValue("unit", item.unit)
          form.setValue("fromLocationId", item.locationId || "")
        }
      } catch (e) {
        console.error(e)
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromItemId])

  useEffect(() => {
    const mid = initialData?.materialId
    if (mid == null || fromItemId) return
    const inv = inventoryItems.find((i) => i.id === mid)
    if (inv) {
      form.setValue("materialSelection", `inv-${inv.id}`)
    } else if (rawMaterials.some((m) => m.id === mid)) {
      form.setValue("materialSelection", String(mid))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.materialId, inventoryItems, rawMaterials, fromItemId])

  const movementTypeOptions = [
    { value: "Receipt", label: "Receipt" },
    { value: "Transfer", label: "Transfer" },
    { value: "Consumption", label: "Consumption" },
    { value: "Shipment", label: "Shipment" },
    { value: "Adjustment", label: "Adjustment" },
    { value: "Issue", label: "Issue" },
    { value: "Return", label: "Return" },
  ]

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

  const requiresFromLocation = ["Transfer", "Consumption", "Shipment", "Issue", "Return"].includes(
    movementType,
  )
  const requiresToLocation = ["Receipt", "Transfer", "Return"].includes(movementType)

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

      const movementData: Record<string, unknown> = {
        movementType: values.movementType,
        materialId,
        materialName: values.materialName || undefined,
        materialCode: values.materialCode || undefined,
        batchNumber: values.batchNumber || undefined,
        quantity: values.quantity,
        unit: values.unit,
        fromLocationId: values.fromLocationId || undefined,
        toLocationId: values.toLocationId || undefined,
        referenceId: values.referenceId || undefined,
        referenceType: values.referenceType || undefined,
        remarks: values.remarks || undefined,
        performedBy: values.performedBy,
      }

      await onSubmit(movementData)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save stock movement"
      form.setError("root", { message: msg })
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Movement Details</CardTitle>
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
                name="movementType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Movement Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select movement type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movementTypeOptions.map((o) => (
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
                    <FormMessage />
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

              {requiresFromLocation && (
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {requiresToLocation && (
                <FormField
                  control={form.control}
                  name="toLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Location</FormLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination location" />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="referenceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Purchase Order" />
                    </FormControl>
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
