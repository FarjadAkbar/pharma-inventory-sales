"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Thermometer,
  AlertTriangle,
  Play,
  Box,
  ShoppingCart,
  FileText,
  Download,
  XCircle,
} from "lucide-react"
import { distributionApi } from "@/services/distribution-api.service"
import { toast } from "sonner"
import type { Shipment, ShipmentItem } from "@/types/distribution"
import { formatDateISO } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ShipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const shipmentId = params.id as string
  
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [allocating, setAllocating] = useState(false)
  const [picking, setPicking] = useState(false)
  const [packing, setPacking] = useState(false)
  const [shipping, setShipping] = useState(false)

  useEffect(() => {
    if (shipmentId) {
      fetchShipment()
    }
  }, [shipmentId])

  const fetchShipment = async () => {
    try {
      setLoading(true)
      const response = await distributionApi.getShipment(shipmentId)
      
      if (response.success && response.data) {
        setShipment(response.data)
      } else {
        toast.error("Failed to fetch shipment")
        router.push("/dashboard/distribution/shipments")
      }
    } catch (error) {
      console.error("Error fetching shipment:", error)
      toast.error("Failed to fetch shipment")
      router.push("/dashboard/distribution/shipments")
    } finally {
      setLoading(false)
    }
  }

  const handleAllocateStock = async (itemId: string, inventoryId: string, quantity: number) => {
    try {
      setAllocating(true)
      const response = await distributionApi.allocateStock({
        shipmentId: parseInt(shipmentId),
        shipmentItemId: parseInt(itemId),
        inventoryId: parseInt(inventoryId),
        quantity,
        allocatedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Stock allocated successfully")
        fetchShipment()
      } else {
        toast.error("Failed to allocate stock")
      }
    } catch (error) {
      console.error("Error allocating stock:", error)
      toast.error("Failed to allocate stock")
    } finally {
      setAllocating(false)
    }
  }

  const handlePickItem = async (itemId: string, pickedQuantity: number) => {
    try {
      setPicking(true)
      const response = await distributionApi.pickItem({
        shipmentItemId: parseInt(itemId),
        pickedQuantity,
        pickedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Item picked successfully")
        fetchShipment()
      } else {
        toast.error("Failed to pick item")
      }
    } catch (error) {
      console.error("Error picking item:", error)
      toast.error("Failed to pick item")
    } finally {
      setPicking(false)
    }
  }

  const handlePackItem = async (itemId: string, packedQuantity: number) => {
    try {
      setPacking(true)
      const response = await distributionApi.packItem({
        shipmentItemId: parseInt(itemId),
        packedQuantity,
        packedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Item packed successfully")
        fetchShipment()
      } else {
        toast.error("Failed to pack item")
      }
    } catch (error) {
      console.error("Error packing item:", error)
      toast.error("Failed to pack item")
    } finally {
      setPacking(false)
    }
  }

  const handleShipOrder = async (trackingNumber: string, carrier: string, serviceType: string) => {
    try {
      setShipping(true)
      const response = await distributionApi.shipOrder(shipmentId, {
        trackingNumber,
        carrier,
        serviceType,
        shippedBy: 1, // TODO: Get from auth context
      })

      if (response.success) {
        toast.success("Shipment marked as shipped")
        fetchShipment()
      } else {
        toast.error("Failed to ship order")
      }
    } catch (error) {
      console.error("Error shipping order:", error)
      toast.error("Failed to ship order")
    } finally {
      setShipping(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Delivered</Badge>
      case "Shipped":
        return <Badge className="bg-purple-100 text-purple-800"><Truck className="h-3 w-3 mr-1" />Shipped</Badge>
      case "Packed":
        return <Badge className="bg-indigo-100 text-indigo-800"><Box className="h-3 w-3 mr-1" />Packed</Badge>
      case "Picked":
        return <Badge className="bg-orange-100 text-orange-800"><CheckCircle className="h-3 w-3 mr-1" />Picked</Badge>
      case "Allocated":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Allocated</Badge>
      case "In Progress":
        return <Badge className="bg-yellow-100 text-yellow-800"><Play className="h-3 w-3 mr-1" />In Progress</Badge>
      case "Pending":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case "Draft":
        return <Badge className="bg-gray-100 text-gray-800"><FileText className="h-3 w-3 mr-1" />Draft</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading shipment...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!shipment) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Shipment not found</div>
        </div>
      </DashboardLayout>
    )
  }

  const allItemsAllocated = shipment.items.every(item => item.status === "Allocated" || item.status === "Picked" || item.status === "Packed" || item.status === "Shipped")
  const allItemsPicked = shipment.items.every(item => item.status === "Picked" || item.status === "Packed" || item.status === "Shipped")
  const allItemsPacked = shipment.items.every(item => item.status === "Packed" || item.status === "Shipped")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/distribution/shipments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{shipment.shipmentNumber}</h1>
              <p className="text-muted-foreground">Sales Order: {shipment.salesOrderNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(shipment.status)}
            {allItemsPacked && shipment.status !== "Shipped" && shipment.status !== "Delivered" && (
              <ShipOrderDialog onShip={handleShipOrder} />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{shipment.accountName}</span>
                </div>
                <div className="text-sm text-muted-foreground">Site: {shipment.siteName}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shipping Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Ship: {formatDateISO(shipment.shipmentDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Expected: {formatDateISO(shipment.expectedDeliveryDate)}</span>
                </div>
                {shipment.actualDeliveryDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Delivered: {formatDateISO(shipment.actualDeliveryDate)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{shipment.shippingAddress.street}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {shipment.shippingAddress.city}, {shipment.shippingAddress.state} {shipment.shippingAddress.postalCode}
                </div>
                <div className="text-sm text-muted-foreground">{shipment.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Items ({shipment.items.length})</TabsTrigger>
            <TabsTrigger value="allocation">Stock Allocation</TabsTrigger>
            <TabsTrigger value="picking">Picking</TabsTrigger>
            <TabsTrigger value="packing">Packing</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{item.drugName}</div>
                          <div className="text-sm text-muted-foreground">
                            Batch: {item.batchNumber} | Location: {item.location || "Not allocated"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} {item.unit}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                      {(item.pickedQuantity > 0 || item.packedQuantity > 0) && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Picked: {item.pickedQuantity} | Packed: {item.packedQuantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Allocate Stock</CardTitle>
                <CardDescription>Allocate inventory items to shipment items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.items.map((item) => (
                    <AllocateStockDialog
                      key={item.id}
                      item={item}
                      onAllocate={handleAllocateStock}
                      disabled={item.status !== "Pending"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="picking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pick Items</CardTitle>
                <CardDescription>Record picked quantities for shipment items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.items.map((item) => (
                    <PickItemDialog
                      key={item.id}
                      item={item}
                      onPick={handlePickItem}
                      disabled={item.status !== "Allocated"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pack Items</CardTitle>
                <CardDescription>Record packed quantities for shipment items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipment.items.map((item) => (
                    <PackItemDialog
                      key={item.id}
                      item={item}
                      onPack={handlePackItem}
                      disabled={item.status !== "Picked"}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Carrier</Label>
                    <div className="text-sm font-medium">{shipment.carrier}</div>
                  </div>
                  <div>
                    <Label>Service Type</Label>
                    <div className="text-sm font-medium">{shipment.serviceType}</div>
                  </div>
                  {shipment.trackingNumber && (
                    <div>
                      <Label>Tracking Number</Label>
                      <div className="text-sm font-medium font-mono">{shipment.trackingNumber}</div>
                    </div>
                  )}
                  {shipment.temperatureRequirements && (
                    <div>
                      <Label>Temperature Requirements</Label>
                      <div className="flex items-center gap-2 text-sm">
                        <Thermometer className="h-4 w-4" />
                        {shipment.temperatureRequirements.minTemperature}°C - {shipment.temperatureRequirements.maxTemperature}°C
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function AllocateStockDialog({ item, onAllocate, disabled }: { item: ShipmentItem; onAllocate: (itemId: string, inventoryId: string, quantity: number) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [inventoryId, setInventoryId] = useState("")
  const [quantity, setQuantity] = useState(item.quantity.toString())

  const handleSubmit = () => {
    if (!inventoryId || !quantity) {
      toast.error("Please fill in all fields")
      return
    }
    onAllocate(item.id, inventoryId, parseFloat(quantity))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full justify-start">
          <Package className="h-4 w-4 mr-2" />
          {item.drugName} - Allocate Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate Stock</DialogTitle>
          <DialogDescription>Allocate inventory to {item.drugName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Inventory ID</Label>
            <Input
              value={inventoryId}
              onChange={(e) => setInventoryId(e.target.value)}
              placeholder="Enter inventory ID"
            />
          </div>
          <div>
            <Label>Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              max={item.quantity}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">Allocate</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PickItemDialog({ item, onPick, disabled }: { item: ShipmentItem; onPick: (itemId: string, quantity: number) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(item.quantity.toString())

  const handleSubmit = () => {
    if (!quantity) {
      toast.error("Please enter quantity")
      return
    }
    onPick(item.id, parseFloat(quantity))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full justify-start">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {item.drugName} - Pick ({item.pickedQuantity}/{item.quantity})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick Item</DialogTitle>
          <DialogDescription>Record picked quantity for {item.drugName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Picked Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              max={item.quantity}
            />
            <div className="text-sm text-muted-foreground mt-1">
              Ordered: {item.quantity} {item.unit}
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">Record Pick</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PackItemDialog({ item, onPack, disabled }: { item: ShipmentItem; onPack: (itemId: string, quantity: number) => void; disabled: boolean }) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(item.pickedQuantity.toString())

  const handleSubmit = () => {
    if (!quantity) {
      toast.error("Please enter quantity")
      return
    }
    onPack(item.id, parseFloat(quantity))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={disabled} className="w-full justify-start">
          <Box className="h-4 w-4 mr-2" />
          {item.drugName} - Pack ({item.packedQuantity}/{item.pickedQuantity})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pack Item</DialogTitle>
          <DialogDescription>Record packed quantity for {item.drugName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Packed Quantity</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              max={item.pickedQuantity}
            />
            <div className="text-sm text-muted-foreground mt-1">
              Picked: {item.pickedQuantity} {item.unit}
            </div>
          </div>
          <Button onClick={handleSubmit} className="w-full">Record Pack</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShipOrderDialog({ onShip }: { onShip: (trackingNumber: string, carrier: string, serviceType: string) => void }) {
  const [open, setOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [carrier, setCarrier] = useState("")
  const [serviceType, setServiceType] = useState("")

  const handleSubmit = () => {
    if (!carrier || !serviceType) {
      toast.error("Please fill in carrier and service type")
      return
    }
    onShip(trackingNumber, carrier, serviceType)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Truck className="h-4 w-4 mr-2" />
          Ship Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ship Order</DialogTitle>
          <DialogDescription>Mark shipment as shipped with tracking information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Tracking Number</Label>
            <Input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>
          <div>
            <Label>Carrier *</Label>
            <Input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Enter carrier name"
              required
            />
          </div>
          <div>
            <Label>Service Type *</Label>
            <Input
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              placeholder="Enter service type"
              required
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">Ship Order</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

