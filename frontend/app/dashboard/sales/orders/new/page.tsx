"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart } from "lucide-react";
import { masterDataApi, sitesApi, distributionApi } from "@/services";
import { toast } from "sonner";
import { UNIT_OPTIONS } from "@/lib/constants";

interface OrderItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unit: string;
  price: number;
  totalPrice: number;
}

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [drugs, setDrugs] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    accountId: "",
    accountName: "",
    accountCode: "",
    siteId: "",
    siteName: "",
    requestedShipDate: "",
    priority: "Normal",
    specialInstructions: "",
    currency: "PKR",
  });
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    Promise.all([
      masterDataApi.getDrugs().catch(() => ({ data: [] })),
      sitesApi.getSites().catch(() => ({ data: [] })),
    ]).then(([drugsRes, sitesRes]) => {
      if (drugsRes?.data?.drugs) {
        setDrugs(drugsRes?.data?.drugs);
      } else if (Array.isArray(drugsRes)) {
        setDrugs(drugsRes);
      }
      if (sitesRes?.data?.sites) {
        setSites(sitesRes.data);
      } else if (Array.isArray(sitesRes)) {
        setSites(sitesRes);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const selectedSite = sites.find(
        (s) => s.id.toString() === formData.siteId,
      );

      const defaultShippingAddress = {
        street: "123 Main Street",
        city: "Karachi",
        state: "Sindh",
        postalCode: "75500",
        country: "Pakistan",
        contactPerson: "Contact Person",
        phone: "+92-300-1234567",
        email: "contact@example.com",
        deliveryInstructions: formData.specialInstructions || "",
      };

      const defaultBillingAddress = {
        ...defaultShippingAddress,
        taxId: "TAX-123456",
      };

      const response = await distributionApi.createSalesOrder({
        accountId: parseInt(formData.accountId),
        accountName: formData.accountName || "Customer Account",
        accountCode: formData.accountCode || `ACC-${formData.accountId}`,
        siteId: parseInt(formData.siteId),
        siteName: selectedSite?.name || formData.siteName || "Site",
        requestedShipDate: formData.requestedShipDate,
        priority: formData.priority,
        totalAmount,
        currency: formData.currency,
        specialInstructions: formData.specialInstructions || undefined,
        items: items.map((item) => {
          const drug = drugs.find((d) => d.id.toString() === item.drugId);
          return {
            drugId: parseInt(item.drugId),
            drugName: drug?.name || item.drugName || "Drug",
            drugCode: drug?.code || `DRUG-${item.drugId}`,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.price,
            totalPrice: item.totalPrice,
          };
        }),
        shippingAddress: defaultShippingAddress,
        billingAddress: defaultBillingAddress,
        createdBy: 1,
      });
      

      if (response.success) {
        console.log("Sales order created:", response.data);
        toast.success("Sales order created successfully");
        router.push("/dashboard/sales/orders");
      } else {
        toast.error("Failed to create sales order");
      }
    } catch (error) {
      console.error("Error creating sales order:", error);
      toast.error("An error occurred while creating the sales order");
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        drugId: "",
        drugName: "",
        quantity: 0,
        unit: "",
        price: 0,
        totalPrice: 0,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof OrderItem,
    value: string | number,
  ) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const updated: OrderItem = { ...item, [field]: value } as any;
          if (field === "quantity" || field === "price") {
            updated.totalPrice = updated.quantity * updated.price;
          }
          return updated;
        }
        return item;
      }),
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              New Sales Order
            </h1>
            <p className="text-muted-foreground">
              Create a new sales order with customer information and product
              details.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Sales Order Details
            </CardTitle>
            <CardDescription>
              Enter customer, shipping, and order details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Customer *</Label>
                  <Select
                    value={formData.accountId}
                    onValueChange={(value) => {
                      const customers: Record<
                        string,
                        { name: string; code: string }
                      > = {
                        "1": {
                          name: "Ziauddin Hospital - Clifton",
                          code: "ACC-001",
                        },
                        "2": {
                          name: "Aga Khan University Hospital",
                          code: "ACC-002",
                        },
                        "3": {
                          name: "Liaquat National Hospital",
                          code: "ACC-003",
                        },
                      };
                      const customer = customers[value];
                      setFormData((prev) => ({
                        ...prev,
                        accountId: value,
                        accountName: customer?.name || "",
                        accountCode: customer?.code || "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        Ziauddin Hospital - Clifton
                      </SelectItem>
                      <SelectItem value="2">
                        Aga Khan University Hospital
                      </SelectItem>
                      <SelectItem value="3">
                        Liaquat National Hospital
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Shipping Site *</Label>
                  <Select
                    value={formData.siteId}
                    onValueChange={(value) => {
                      const site = sites.find((s) => s.id.toString() === value);
                      setFormData((prev) => ({
                        ...prev,
                        siteId: value,
                        siteName: site?.name || "",
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id.toString()}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Requested Ship Date *</Label>
                  <Input
                    type="date"
                    value={formData.requestedShipDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requestedShipDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currency: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialInstructions: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                  <Button type="button" variant="outline" onClick={addItem}>
                    Add Item
                  </Button>
                </div>

                {items.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-medium">Item {index + 1}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select
                          value={item.drugId}
                          onValueChange={(value) =>
                            updateItem(index, "drugId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {drugs.map((drug: any) => (
                              <SelectItem
                                key={drug.id}
                                value={drug.id.toString()}
                              >
                                {drug.name} ({drug.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Select
                          value={item.unit}
                          onValueChange={(value) =>
                            updateItem(index, "unit", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((u) => (
                              <SelectItem key={u.value} value={u.value}>
                                {u.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          min={0}
                          value={item.price}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/sales/orders")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Sales Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
