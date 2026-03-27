"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form-hook"
import { Plus, Trash2, FileText, ShoppingCart, User, Building2, Calendar, Loader2 } from "lucide-react"
import { purchaseOrdersApi, sitesApi, masterDataApi, suppliersApi } from "@/services"
import { toast } from "@/lib/toast"
import { unwrapListResponse } from "@/lib/unwrap-api-list"

const poStatuses = ["Draft", "Pending", "Approved", "Received", "Cancelled"] as const

const purchaseOrderItemSchema = z.object({
  id: z.number().optional(),
  rawMaterialId: z.coerce.number(),
  rawMaterialName: z.string().optional(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
})

const purchaseOrderFormSchema = z.object({
  siteId: z.coerce.number(),
  supplierId: z.coerce.number().refine((n) => n > 0, "Select a supplier"),
  status: z.enum(poStatuses),
  expectedDate: z.string().min(1, "Expected date is required"),
  note: z.string().optional(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, "Add at least one line item")
    .superRefine((rows, ctx) => {
      rows.forEach((row, i) => {
        if (row.rawMaterialId <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Select a raw material",
            path: [i, "rawMaterialId"],
          })
        }
        if (!(row.quantity > 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Quantity must be greater than 0",
            path: [i, "quantity"],
          })
        }
        if (!(row.unitPrice > 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Unit price must be greater than 0",
            path: [i, "unitPrice"],
          })
        }
      })
    }),
})

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>

interface Site {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

interface RawMaterialOption {
  id: number
  name: string
  code: string
  unit?: string
}

interface PurchaseOrderFormProps {
  purchaseOrderId?: number
  onSuccess: () => void
  onCancel: () => void
}

const defaultValues: PurchaseOrderFormValues = {
  siteId: 0,
  supplierId: 0,
  status: "Draft",
  expectedDate: "",
  note: "",
  items: [],
}

export function PurchaseOrderForm({ purchaseOrderId, onSuccess, onCancel }: PurchaseOrderFormProps) {
  const isEdit = !!purchaseOrderId

  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderFormSchema),
    defaultValues,
    mode: "onSubmit",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const itemsWatch = form.watch("items")
  const totalAmount = (itemsWatch ?? []).reduce((sum, item) => {
    const q = Number(item?.quantity) || 0
    const p = Number(item?.unitPrice) || 0
    return sum + q * p
  }, 0)

  const [sites, setSites] = useState<Site[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterialOption[]>([])
  const [fetching, setFetching] = useState(true)
  const loading = form.formState.isSubmitting

  useEffect(() => {
    const load = async () => {
      setFetching(true)
      try {
        const [sitesData, suppliersData, res] = await Promise.all([
          sitesApi.getSites(),
          suppliersApi.getSuppliers(),
          masterDataApi.getRawMaterials().catch(() => []),
        ])
        setSites(sitesData.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name })))
        setSuppliers(suppliersData.map((s: { id: number; name: string }) => ({ id: s.id, name: s.name })))
        const list = unwrapListResponse<Record<string, unknown>>(res)
        setRawMaterials(
          list
            .map((m) => ({
              id: Number(m.id),
              name: String(m.name ?? ""),
              code: String(m.code ?? ""),
              unit: m.unit != null ? String(m.unit) : undefined,
            }))
            .filter((m) => Number.isFinite(m.id) && m.id > 0),
        )

        if (isEdit && purchaseOrderId) {
          const order = await purchaseOrdersApi.getPurchaseOrder(purchaseOrderId.toString())
          form.reset({
            siteId: order.siteId || 0,
            supplierId: order.supplierId,
            status: order.status as PurchaseOrderFormValues["status"],
            expectedDate: new Date(order.expectedDate).toISOString().split("T")[0],
            note: "",
            items: (order.items || []).map((it) => ({
              id: it.id,
              rawMaterialId: it.rawMaterialId,
              rawMaterialName: it.rawMaterial?.name,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
            })),
          })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setFetching(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load options + optional PO when purchaseOrderId changes
  }, [purchaseOrderId, isEdit])

  const addItem = () => {
    append({
      rawMaterialId: 0,
      quantity: 1,
      unitPrice: 0,
    })
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const submitData = {
        supplierId: values.supplierId,
        siteId: values.siteId > 0 ? values.siteId : undefined,
        expectedDate: new Date(values.expectedDate).toISOString(),
        items: values.items.map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        status: values.status,
      }

      if (isEdit && purchaseOrderId) {
        await purchaseOrdersApi.updatePurchaseOrder(purchaseOrderId.toString(), submitData)
        toast.success("Purchase order updated", "The purchase order has been updated successfully.")
      } else {
        await purchaseOrdersApi.createPurchaseOrder(submitData)
        toast.success("Purchase order created", "The purchase order has been created successfully.")
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      const msg = error instanceof Error ? error.message : "Failed to save purchase order."
      toast.error("Error", msg)
    }
  })

  if (fetching) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Enter supplier, site, and order details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Supplier <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      value={field.value > 0 ? String(field.value) : undefined}
                      onValueChange={(v) => field.onChange(parseInt(v, 10))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
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
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Site <span className="text-muted-foreground text-xs">(Optional)</span>
                    </FormLabel>
                    <Select
                      value={field.value > 0 ? String(field.value) : "0"}
                      onValueChange={(v) => field.onChange(v === "0" ? 0 : parseInt(v, 10))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select site (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {sites.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {poStatuses.map((s) => (
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
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Expected Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Additional notes or comments" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>Add raw materials and quantities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Raw Material</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Quantity</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Unit Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Line Total</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((row, index) => {
                        const q = Number(form.watch(`items.${index}.quantity`)) || 0
                        const p = Number(form.watch(`items.${index}.unitPrice`)) || 0
                        return (
                          <tr key={row.id} className="border-t hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <FormField
                                control={form.control}
                                name={`items.${index}.rawMaterialId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      value={field.value > 0 ? String(field.value) : undefined}
                                      onValueChange={(v) => {
                                        const id = parseInt(v, 10)
                                        field.onChange(id)
                                        const m = rawMaterials.find((rm) => rm.id === id)
                                        form.setValue(`items.${index}.rawMaterialName`, m?.name)
                                      }}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full min-w-[200px]">
                                          <SelectValue placeholder="Select material" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {rawMaterials.map((m) => (
                                          <SelectItem key={m.id} value={String(m.id)}>
                                            <div className="flex flex-col">
                                              <span className="font-medium">{m.code}</span>
                                              <span className="text-xs text-muted-foreground">{m.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </td>
                            <td className="px-4 py-3">
                              <FormField
                                control={form.control}
                                name={`items.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0.01}
                                        step={0.01}
                                        className="w-24"
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
                            </td>
                            <td className="px-4 py-3">
                              <FormField
                                control={form.control}
                                name={`items.${index}.unitPrice`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        className="w-32"
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
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="secondary" className="text-sm font-mono">
                                {(q * p).toFixed(2)} PKR
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No items added yet</p>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Item
                </Button>
              </div>
            )}

            <Button type="button" onClick={addItem} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add Another Item
            </Button>
          </CardContent>
        </Card>

        <Card className="sticky bottom-0 bg-background border-t-2 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  PKR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fields.length} {fields.length === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEdit ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{isEdit ? "Update Order" : "Create Order"}</>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
