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
import { masterDataApi, manufacturingApi } from "@/services"
import { unwrapListResponse } from "@/lib/unwrap-api-list"
import { toast } from "sonner"

const materialConsumptionSchema = z.object({
  materialId: z.string().min(1, "Select a material"),
  materialName: z.string(),
  materialCode: z.string(),
  batchNumber: z.string().min(1, "Batch number is required"),
  plannedQuantity: z.coerce.number().positive("Planned quantity must be positive"),
  actualQuantity: z.coerce.number().positive("Actual quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  locationId: z.string().optional(),
  remarks: z.string().optional(),
})

type MaterialConsumptionFormValues = z.infer<typeof materialConsumptionSchema>

interface MaterialConsumptionFormProps {
  batchId: string
  onSuccess?: () => void
}

export function MaterialConsumptionForm({ batchId, onSuccess }: MaterialConsumptionFormProps) {
  const [rawMaterials, setRawMaterials] = useState<
    Array<{ id: number; name: string; code: string; unit?: string }>
  >([])

  const form = useForm<MaterialConsumptionFormValues>({
    resolver: zodResolver(materialConsumptionSchema),
    defaultValues: {
      materialId: "",
      materialName: "",
      materialCode: "",
      batchNumber: "",
      plannedQuantity: 0,
      actualQuantity: 0,
      unit: "",
      locationId: "",
      remarks: "",
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const materialsRes = await masterDataApi.getRawMaterials().catch(() => [])
        setRawMaterials(
          unwrapListResponse<Record<string, unknown>>(materialsRes).map((m) => ({
            id: Number(m.id),
            name: String(m.name ?? ""),
            code: String(m.code ?? ""),
            unit: m.unit != null ? String(m.unit) : undefined,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  const onMaterialChange = (id: string) => {
    const material = rawMaterials.find((m) => m.id.toString() === id)
    form.setValue("materialId", id)
    if (material) {
      form.setValue("materialName", material.name)
      form.setValue("materialCode", material.code)
      if (material.unit) form.setValue("unit", material.unit)
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await manufacturingApi.consumeMaterial(batchId, {
        ...values,
        materialId: parseInt(values.materialId, 10),
        locationId: values.locationId ? parseInt(values.locationId, 10) : undefined,
        consumedBy: 1,
      })

      if (response.success) {
        toast.success("Material consumption recorded")
        onSuccess?.()
        form.reset({
          materialId: "",
          materialName: "",
          materialCode: "",
          batchNumber: "",
          plannedQuantity: 0,
          actualQuantity: 0,
          unit: "",
          locationId: "",
          remarks: "",
        })
      } else {
        toast.error(response.message || "Failed to record consumption")
      }
    } catch (error) {
      console.error("Error recording consumption:", error)
      toast.error("An error occurred")
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
                  onMaterialChange(v)
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rawMaterials.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name} ({m.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Record Consumption
        </Button>
      </form>
    </Form>
  )
}
