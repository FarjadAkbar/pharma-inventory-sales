"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form-hook"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, FileText, Camera, Signature } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"

const proofOfDeliverySchema = z.object({
  shipmentId: z.string().min(1, "Shipment is required"),
  salesOrderId: z.string().min(1, "Sales Order is required"),
  accountId: z.string().min(1, "Customer is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliveryTime: z.string().min(1, "Delivery time is required"),
  deliveredByName: z.string().min(1, "Delivered by is required"),
  receivedByName: z.string().min(1, "Received by is required"),
  receivedByTitle: z.string().min(1, "Received by title is required"),
  deliveryStatus: z.enum(["Delivered", "Partial", "Rejected", "Damaged", "Returned"]),
  conditionAtDelivery: z.enum(["Good", "Damaged", "Compromised"]),
  temperatureAtDelivery: z.number().min(-50).max(50, "Temperature must be between -50°C and 50°C"),
  signature: z.string().optional(),
  photos: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

type ProofOfDeliveryFormData = z.infer<typeof proofOfDeliverySchema>

interface ProofOfDeliveryFormProps {
  onSuccess?: () => void
  pod?: any
}

export function ProofOfDeliveryForm({ onSuccess, pod }: ProofOfDeliveryFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<ProofOfDeliveryFormData>({
    resolver: zodResolver(proofOfDeliverySchema),
    defaultValues: {
      shipmentId: pod?.shipmentId || "",
      salesOrderId: pod?.salesOrderId || "",
      accountId: pod?.accountId || "",
      deliveryDate: pod?.deliveryDate || "",
      deliveryTime: pod?.deliveryTime || "",
      deliveredByName: pod?.deliveredByName || "",
      receivedByName: pod?.receivedByName || "",
      receivedByTitle: pod?.receivedByTitle || "",
      deliveryStatus: pod?.deliveryStatus || "Delivered",
      conditionAtDelivery: pod?.conditionAtDelivery || "Good",
      temperatureAtDelivery: pod?.temperatureAtDelivery || 0,
      signature: pod?.signature || "",
      photos: pod?.photos || [],
      notes: pod?.notes || "",
    },
  })

  const onSubmit = async (data: ProofOfDeliveryFormData) => {
    try {
      setLoading(true)
      
      const response = pod 
        ? await apiService.updateProofOfDelivery(pod.id, data)
        : await apiService.createProofOfDelivery(data)
      
      if (response.success) {
        toast.success(pod ? "Proof of delivery updated successfully" : "Proof of delivery created successfully")
        form.reset()
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(response.message || "Failed to save proof of delivery")
      }
    } catch (error) {
      console.error("Error saving proof of delivery:", error)
      toast.error("Failed to save proof of delivery")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          New POD
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {pod ? "Edit Proof of Delivery" : "Create Proof of Delivery"}
          </DialogTitle>
          <DialogDescription>
            {pod ? "Update proof of delivery details" : "Record a new proof of delivery"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shipmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipment</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shipment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">SH-2024-001 - Ziauddin Hospital</SelectItem>
                        <SelectItem value="2">SH-2024-002 - Aga Khan Hospital</SelectItem>
                        <SelectItem value="3">SH-2024-003 - Liaquat Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesOrderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Order</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sales order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">SO-2024-001 - Ziauddin Hospital</SelectItem>
                        <SelectItem value="2">SO-2024-002 - Aga Khan Hospital</SelectItem>
                        <SelectItem value="3">SO-2024-003 - Liaquat Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Ziauddin Hospital - Clifton</SelectItem>
                        <SelectItem value="2">Aga Khan University Hospital</SelectItem>
                        <SelectItem value="3">Liaquat National Hospital</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveredByName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivered By</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter delivery person name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedByName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Received By</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter receiver name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedByTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Receiver Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter receiver title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deliveryStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                        <SelectItem value="Returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conditionAtDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition at Delivery</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Damaged">Damaged</SelectItem>
                        <SelectItem value="Compromised">Compromised</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperatureAtDelivery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature at Delivery (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Enter temperature" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Signature</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Signature className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to capture signature</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Photos</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to capture photos</p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes about the delivery" 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                {loading ? "Saving..." : pod ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
