"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { manufacturingApi, masterDataApi, warehouseApi } from "@/services"
import { unwrapListResponse } from "@/lib/unwrap-api-list"

const consumptionStatuses = ["Pending", "Consumed", "Rejected"] as const

const consumptionFormSchema = z.object({
  batchId: z.string().min(1, "Select a batch"),
  materialId: z.string().min(1, "Select a material"),
  materialName: z.string(),
  materialCode: z.string(),
  batchNumber: z.string().min(1, "Material batch number is required"),
  plannedQuantity: z.coerce.number().positive(),
  actualQuantity: z.coerce.number().positive(),
  unit: z.string().min(1, "Unit is required"),
  locationId: z.string().optional(),
  status: z.enum(consumptionStatuses),
  remarks: z.string().optional(),
})

type ConsumptionFormValues = z.infer<typeof consumptionFormSchema>

interface ConsumptionFormProps {
  initialData?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  loading?: boolean
  submitLabel?: string
}

export function ConsumptionForm({
  initialData,
  onSubmit,
  loading = false,
  submitLabel = "Save Consumption",
}: ConsumptionFormProps) {
  const [batches, setBatches] = useState<
    Array<{ id: number; batchNumber?: string; drugName?: string }>
  >([])
  const [materials, setMaterials] = useState<
    Array<{ id: number; name: string; code: string; unit?: string }>
  >([])
  const [locations, setLocations] = useState<
    Array<{ id: number; name?: string; code?: string }>
  >([])

  const form = useForm<ConsumptionFormValues>({
    resolver: zodResolver(consumptionFormSchema),
    defaultValues: {
      batchId: initialData?.batchId != null ? String(initialData.batchId) : "",
      materialId: initialData?.materialId != null ? String(initialData.materialId) : "",
      materialName: String(initialData?.materialName ?? ""),
      materialCode: String(initialData?.materialCode ?? ""),
      batchNumber: String(initialData?.batchNumber ?? ""),
      plannedQuantity: initialData?.plannedQuantity != null ? Number(initialData.plannedQuantity) : 0,
      actualQuantity: initialData?.actualQuantity != null ? Number(initialData.actualQuantity) : 0,
      unit: String(initialData?.unit ?? ""),
      locationId: initialData?.locationId != null ? String(initialData.locationId) : "",
      status: (initialData?.status as ConsumptionFormValues["status"]) || "Consumed",
      remarks: String(initialData?.remarks ?? ""),
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    Promise.all([
      manufacturingApi.getBatches().catch(() => ({ data: { batches: [] } })),
      masterDataApi.getRawMaterials().catch(() => []),
      warehouseApi.getStorageLocations().catch(() => ({ data: [] })),
    ]).then(([batchesRes, materialsRes, locationsRes]) => {
      if (batchesRes?.data?.batches) {
        setBatches(
          Array.isArray(batchesRes.data.batches) ? batchesRes.data.batches : [],
        )
      } else if (Array.isArray(batchesRes)) {
        setBatches(batchesRes)
      }
      setMaterials(
        unwrapListResponse<Record<string, unknown>>(materialsRes).map((m) => ({
          id: Number(m.id),
          name: String(m.name ?? ""),
          code: String(m.code ?? ""),
          unit: m.unit != null ? String(m.unit) : undefined,
        })),
      )
      if (locationsRes?.data) {
        setLocations(Array.isArray(locationsRes.data) ? locationsRes.data : [])
      } else if (Array.isArray(locationsRes)) {
        setLocations(locationsRes)
      }
    })
  }, [])

  const handleFormSubmit = form.handleSubmit(async (values) => {
    const submitData = {
      batchId: values.batchId,
      materialId: parseInt(values.materialId, 10),
      materialName: values.materialName,
      materialCode: values.materialCode,
      batchNumber: values.batchNumber,
      plannedQuantity: values.plannedQuantity,
      actualQuantity: values.actualQuantity,
      unit: values.unit,
      locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
      status: values.status,
      remarks: values.remarks || undefined,
      consumedBy: 1,
    }
    await onSubmit(submitData)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="batchId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Batch *</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v)
                    const batch = batches.find((b) => b.id.toString() === v)
                    if (batch) {
                      form.setValue("batchNumber", batch.batchNumber ?? "")
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={String(batch.id)}>
                        {batch.batchNumber} - {batch.drugName ?? ""}
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
            name="materialId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material *</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={(v) => {
                    field.onChange(v)
                    const material = materials.find((m) => m.id.toString() === v)
                    if (material) {
                      form.setValue("materialName", material.name)
                      form.setValue("materialCode", material.code)
                      if (material.unit) form.setValue("unit", material.unit)
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem key={material.id} value={String(material.id)}>
                        {material.name} ({material.code})
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
            name="batchNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material Batch Number *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plannedQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Planned Quantity *</FormLabel>
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
            name="actualQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Quantity *</FormLabel>
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
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name} ({location.code})
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {consumptionStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
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
            name="remarks"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={loading || form.formState.isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
