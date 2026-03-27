"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import type { BOM } from "@/types/manufacturing"
import { Plus, Trash2, Package, AlertCircle } from "lucide-react"
import { masterDataApi } from "@/services"
import { unwrapListResponse } from "@/lib/unwrap-api-list"
import { Checkbox } from "@/components/ui/checkbox"

const bomLineSchema = z.object({
  materialId: z.string().min(1, "Select material"),
  materialName: z.string(),
  materialCode: z.string(),
  quantityPerBatch: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Select unit"),
  tolerance: z.coerce.number().nonnegative(),
  isCritical: z.boolean(),
  remarks: z.string().optional(),
})

const bomFormSchema = z.object({
  drugId: z.string().min(1, "Please select a drug"),
  drugName: z.string(),
  drugCode: z.string(),
  version: z.coerce.number(),
  status: z.string(),
  batchSize: z.string().min(1, "Please enter batch size"),
  yield: z.string().min(1, "Please enter yield percentage"),
  effectiveDate: z.string(),
  notes: z.string().optional(),
  items: z.array(bomLineSchema).min(1, "Please add at least one material item"),
})

type BOMFormValues = z.infer<typeof bomFormSchema>

interface BOMFormProps {
  initialData?: Partial<BOM>
  onSubmit: (data: BOM) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

export function BOMForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: BOMFormProps) {
  const [drugs, setDrugs] = useState<{ value: string; label: string }[]>([])
  const [materials, setMaterials] = useState<{ value: string; label: string }[]>([])
  const [units, setUnits] = useState<{ value: string; label: string }[]>([])

  const defaultValues: BOMFormValues = {
    drugId: initialData?.drugId != null ? String(initialData.drugId) : "",
    drugName: initialData?.drugName || "",
    drugCode: initialData?.drugCode || "",
    version: initialData?.version ?? 1,
    status: initialData?.status || "Draft",
    batchSize: initialData?.batchSize != null ? String(initialData.batchSize) : "",
    yield: initialData?.yield != null ? String(initialData.yield) : "",
    effectiveDate:
      initialData?.effectiveDate || new Date().toISOString().split("T")[0],
    notes: initialData?.notes || "",
    items:
      initialData?.items?.map((it: any) => ({
        materialId: String(it.materialId ?? ""),
        materialName: it.materialName || "",
        materialCode: it.materialCode || "",
        quantityPerBatch: Number(it.quantityPerBatch) || 0,
        unit: it.unit || "",
        tolerance: it.tolerance != null ? Number(it.tolerance) : 5,
        isCritical: !!it.isCritical,
        remarks: it.remarks || "",
      })) ?? [],
  }

  const form = useForm<BOMFormValues>({
    resolver: zodResolver(bomFormSchema),
    defaultValues,
    mode: "onSubmit",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const itemsWatch = form.watch("items")

  useEffect(() => {
    async function loadOptions() {
      try {
        const [drugsRes, materialsRes, unitsRes] = await Promise.all([
          masterDataApi.getDrugs({ limit: 100 }).catch(() => null),
          masterDataApi.getRawMaterials({ limit: 100 }).catch(() => []),
          masterDataApi.getUnits().catch(() => null),
        ])
        if (drugsRes?.data) {
          const drugsList = (drugsRes.data as { drugs?: unknown }).drugs ?? drugsRes.data
          if (Array.isArray(drugsList)) {
            setDrugs(
              drugsList.map((d: { id: number; name: string; code: string }) => ({
                value: String(d.id),
                label: `${d.name} - ${d.code}`,
              })),
            )
          }
        }
        const materialsList = unwrapListResponse(materialsRes)
        setMaterials(
          materialsList.map((m: { id: number; name: string; code: string }) => ({
            value: String(m.id),
            label: `${m.name} - ${m.code}`,
          })),
        )
        if (unitsRes?.data?.units && Array.isArray(unitsRes.data.units)) {
          setUnits(
            unitsRes.data.units.map((u: { symbol?: string; code?: string; name?: string }) => ({
              value: u.symbol ?? u.code ?? u.name ?? "",
              label: u.name ?? u.code ?? u.symbol ?? "",
            })),
          )
        }
      } catch {
        // options optional
      }
    }
    loadOptions()
  }, [])

  const handleFormSubmit = form.handleSubmit(async (values) => {
    try {
      const mappedItems = values.items.map((item, index) => ({
        materialId: Number(item.materialId),
        materialName: item.materialName,
        materialCode: item.materialCode,
        quantityPerBatch: Number(item.quantityPerBatch),
        unit: item.unit,
        tolerance: item.tolerance != null ? Number(item.tolerance) : undefined,
        isCritical: !!item.isCritical,
        sequence: index + 1,
        remarks: item.remarks || undefined,
      }))

      await onSubmit({
        drugId: Number(values.drugId),
        drugName: values.drugName,
        drugCode: values.drugCode,
        batchSize: Number(values.batchSize),
        yield: values.yield !== "" ? Number(values.yield) : undefined,
        effectiveDate: values.effectiveDate,
        expiryDate: initialData?.expiryDate,
        status: values.status,
        items: mappedItems,
        remarks: values.notes || undefined,
        bomNumber: initialData?.bomNumber || `BOM-${Date.now()}`,
        createdBy: 1,
      } as unknown as BOM)
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to save BOM"
      form.setError("root", { message: msg })
    }
  })

  const addItem = () => {
    append({
      materialId: "",
      materialName: "",
      materialCode: "",
      quantityPerBatch: 0,
      unit: "",
      tolerance: 5,
      isCritical: false,
      remarks: "",
    })
  }

  const applyMaterial = (index: number, value: string) => {
    const material = materials.find((m) => m.value === value)
    const parts = material?.label.split(" - ") ?? []
    form.setValue(`items.${index}.materialId`, value)
    form.setValue(`items.${index}.materialName`, parts[0] ?? "")
    form.setValue(`items.${index}.materialCode`, parts[1] ?? "")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bill of Materials Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {form.formState.errors.root && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="drugId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drug *</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={(v) => {
                        field.onChange(v)
                        const drug = drugs.find((d) => d.value === v)
                        const parts = drug?.label.split(" - ") ?? []
                        form.setValue("drugName", parts[0] || "")
                        form.setValue("drugCode", parts[1] || "")
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a drug" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {drugs.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
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
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        disabled
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batchSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Size *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1000 tablets" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Yield (%) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="95" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
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
                        {[
                          "Draft",
                          "Under Review",
                          "Approved",
                          "Active",
                          "Obsolete",
                        ].map((s) => (
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
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Material requirements</h3>
                <Button type="button" onClick={addItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  Add Material
                </Button>
              </div>

              {fields.map((row, index) => (
                <Card key={row.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Material {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => remove(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.materialId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <Select
                            value={field.value || undefined}
                            onValueChange={(v) => {
                              field.onChange(v)
                              applyMaterial(index, v)
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select material" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {materials.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
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
                      name={`items.${index}.quantityPerBatch`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity per Batch</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.001"
                              placeholder="0.000"
                              value={field.value === undefined || field.value === null ? "" : field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? 0 : parseFloat(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit of Measure</FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((u) => (
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
                      name={`items.${index}.tolerance`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tolerance (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              value={field.value === undefined || field.value === null ? "" : field.value}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === "" ? 0 : parseFloat(e.target.value),
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.isCritical`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(c) => field.onChange(c === true)}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Critical Material</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.remarks`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Remarks</FormLabel>
                          <FormControl>
                            <Input placeholder="Special handling" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No materials added yet. Click &quot;Add Material&quot; to get started.</p>
                </div>
              )}

              {itemsWatch && itemsWatch.length > 0 && (
                <Card className="p-4 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Materials:</span>
                    <div className="flex items-center gap-4">
                      <span className="text-lg">{itemsWatch.length} materials</span>
                      <span className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {itemsWatch.filter((item) => item.isCritical).length} critical
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
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
