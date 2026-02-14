"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  User, 
  CreditCard, 
  Search,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { salesCrmApi } from "@/services/sales-crm-api.service"
import { masterDataApi } from "@/services"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

export default function NewPOSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [searchProduct, setSearchProduct] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [customerName, setCustomerName] = useState("")

  const [total, setTotal] = useState({
    subtotal: 0,
    tax: 0,
    discount: 0,
    grandTotal: 0
  })

  useEffect(() => {
    // In a real app we'd fetch actual inventory/products
    // For now, let's fetch drugs as representative products
    fetchProducts()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [selectedItems])

  const fetchProducts = async () => {
    try {
      const response = await masterDataApi.getDrugs({ limit: 100 })
      if (response.success && response.data) {
        setProducts(response.data.drugs || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }

  const addItem = (product: any) => {
    const existing = selectedItems.find(item => item.productId === product.id)
    if (existing) {
      setSelectedItems(selectedItems.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ))
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: 10.00, // Mock price since not in drug model
        totalPrice: 10.00
      }])
    }
  }

  const removeItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    setSelectedItems(selectedItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
        : item
    ))
  }

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((acc, item) => acc + item.totalPrice, 0)
    const tax = subtotal * 0.15 // 15% VAT
    const discount = 0 // No discount for now
    const grandTotal = subtotal + tax - discount

    setTotal({ subtotal, tax, discount, grandTotal })
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert("Please add at least one item")
      return
    }

    try {
      setLoading(true)
      const payload = {
        terminalId: "TERM-001",
        terminalName: "Counter 1",
        siteId: 1,
        siteName: "Central Pharmacy",
        cashierId: 1,
        cashierName: "Admin",
        customerName: customerName || "Walk-in",
        items: selectedItems,
        subtotal: total.subtotal,
        tax: total.tax,
        discount: total.discount,
        total: total.grandTotal,
        paymentMethod: paymentMethod,
        paymentStatus: "completed",
        status: "completed",
        createdBy: 1
      }

      const response = await salesCrmApi.createPOSTransaction(payload)
      if (response.success) {
        alert("Transaction completed successfully!")
        router.push("/dashboard/sales/pos")
      }
    } catch (error) {
      console.error("Failed to create transaction:", error)
      alert("Failed to complete transaction")
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.code.toLowerCase().includes(searchProduct.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales/pos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">New POS Transaction</h1>
            <p className="text-muted-foreground">Create a retail sale and generate a receipt</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5" />
                  Select Products
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search products by name or code..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                  {filteredProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start gap-1 justify-between text-left hover:border-orange-500 hover:bg-orange-50/50"
                      onClick={() => addItem(product)}
                    >
                      <div className="w-full flex justify-between items-start">
                        <span className="font-bold text-sm truncate">{product.name}</span>
                        <span className="text-xs text-orange-600 font-mono">{product.code}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{product.strength} - {product.dosageForm}</span>
                      <div className="w-full flex justify-between items-center mt-2">
                        <span className="font-bold text-blue-600">{formatCurrency(10.00)}</span>
                        <Plus className="h-4 w-4 text-orange-600" />
                      </div>
                    </Button>
                  ))}
                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-8 text-center text-muted-foreground">
                      No products found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShoppingCart className="h-5 w-5" />
                  Cart Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[100px]">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalPrice)}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.productId)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          Your cart is empty.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Checkout & Summary */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input 
                    placeholder="Enter customer name..." 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for Walk-in customer</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">Sales Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Subtotal</span>
                  <span className="font-medium">{formatCurrency(total.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Tax (15% VAT)</span>
                  <span className="font-medium">{formatCurrency(total.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-orange-700">Discount</span>
                  <span className="font-medium text-red-600">-{formatCurrency(total.discount)}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-orange-200 flex justify-between font-bold text-lg text-orange-900">
                  <span>Grand Total</span>
                  <span>{formatCurrency(total.grandTotal)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 py-6 text-lg" 
                  onClick={handleSubmit}
                  disabled={loading || selectedItems.length === 0}
                >
                  {loading ? "Processing..." : "Complete Sale"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
