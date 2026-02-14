"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form-hook"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Thermometer, AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { apiService } from "@/services/api.service"
import { toast } from "sonner"

const temperatureExcursionSchema = z.object({
  shipmentId: z.string().min(1, "Shipment is required"),
  drugName: z.string().min(1, "Drug name is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  actualTemperature: z.number().min(-50).max(50, "Temperature must be between -50°C and 50°C"),
  minTemperature: z.number().min(-50).max(50),
  maxTemperature: z.number().min(-50).max(50),
  severity: z.enum(["Low", "Medium", "High", "Critical"]),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  description: z.string().optional(),
})

type TemperatureExcursionFormData = z.infer<typeof temperatureExcursionSchema>

interface TemperatureExcursionFormProps {
  onSuccess?: () => void
  excursion?: any
}

export function TemperatureExcursionForm({ onSuccess, excursion }: TemperatureExcursionFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm<TemperatureExcursionFormData>({
    resolver: zodResolver(temperatureExcursionSchema),
    defaultValues: {
      shipmentId: excursion?.shipmentId || "",
      drugName: excursion?.drugName || "",
      batchNumber: excursion?.batchNumber || "",
      actualTemperature: excursion?.actualTemperature || 0,
      minTemperature: excursion?.minTemperature || 2,
      maxTemperature: excursion?.maxTemperature || 8,
      severity: excursion?.severity || "Low",
      duration: excursion?.duration || 1,
      description: excursion?.description || "",
    },
  })

  const onSubmit = async (data: TemperatureExcursionFormData) => {
    try {
      setLoading(true)
      
      const response = excursion 
        ? await apiService.updateTemperatureExcursion(excursion.id, data)
        : await apiService.createTemperatureExcursion(data)
      
      if (response.success) {
        toast.success(excursion ? "Temperature excursion updated successfully" : "Temperature excursion created successfully")
        form.reset()
        setOpen(false)
        onSuccess?.()
      } else {
        toast.error(response.message || "Failed to save temperature excursion")
      }
    } catch (error) {
      console.error("Error saving temperature excursion:", error)
      toast.error("Failed to save temperature excursion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          New Alert
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            {excursion ? "Edit Temperature Excursion" : "Create Temperature Excursion"}
          </DialogTitle>
          <DialogDescription>
            {excursion ? "Update temperature excursion details" : "Record a new temperature excursion alert"}
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
                name="drugName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drug Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter drug name" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="Enter batch number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actualTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Actual Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Enter actual temperature" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Enter min temperature" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxTemperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Enter max temperature" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter duration in minutes" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter description of the temperature excursion" 
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
                {loading ? "Saving..." : excursion ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
