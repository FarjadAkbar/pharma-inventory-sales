import type { NextRequest } from "next/server"
import { requireAuth } from "@/lib/auth-middleware"
import { mockSalesOrders } from "@/lib/distribution-mock-data"
import { validateText } from "@/lib/validations"
import type { SalesOrder, SalesOrderFilters, DistributionAPIResponse } from "@/types/distribution"

export async function GET(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "sales_rep", "distribution_ops", "warehouse_ops"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const search = searchParams.get("search")
      const accountId = searchParams.get("accountId")
      const status = searchParams.get("status")
      const priority = searchParams.get("priority")
      const siteId = searchParams.get("siteId")
      const dateFrom = searchParams.get("dateFrom")
      const dateTo = searchParams.get("dateTo")
      const createdBy = searchParams.get("createdBy")
      const page = Number.parseInt(searchParams.get("page") || "1")
      const limit = Number.parseInt(searchParams.get("limit") || "10")

      let filteredOrders = [...mockSalesOrders]

      // Apply search filter
      if (search) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
            order.accountName.toLowerCase().includes(search.toLowerCase()) ||
            order.accountCode.toLowerCase().includes(search.toLowerCase()) ||
            order.salesOrderNumber.toLowerCase().includes(search.toLowerCase())
        )
      }

      // Apply filters
      if (accountId) {
        filteredOrders = filteredOrders.filter((order) => order.accountId === accountId)
      }

      if (status) {
        filteredOrders = filteredOrders.filter((order) => order.status === status)
      }

      if (priority) {
        filteredOrders = filteredOrders.filter((order) => order.priority === priority)
      }

      if (siteId) {
        filteredOrders = filteredOrders.filter((order) => order.siteId === siteId)
      }

      if (dateFrom) {
        filteredOrders = filteredOrders.filter((order) => order.createdAt >= dateFrom)
      }

      if (dateTo) {
        filteredOrders = filteredOrders.filter((order) => order.createdAt <= dateTo)
      }

      if (createdBy) {
        filteredOrders = filteredOrders.filter((order) => order.createdBy === createdBy)
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

      const response: DistributionAPIResponse<{ salesOrders: SalesOrder[]; pagination: any }> = {
        success: true,
        data: {
          salesOrders: paginatedOrders,
          pagination: {
            page,
            limit,
            total: filteredOrders.length,
            totalPages: Math.ceil(filteredOrders.length / limit),
          },
        },
      }

      return Response.json(response)
    } catch (error) {
      console.error("Get sales orders error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function POST(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "sales_rep"])(request, async (req, user) => {
    try {
      const orderData = await request.json()

      // Validation
      const { accountId, accountName, accountCode, siteId, siteName, requestedShipDate, items, shippingAddress, billingAddress } = orderData

      if (!accountId || !accountName || !accountCode || !siteId || !siteName || !requestedShipDate || !items || !shippingAddress || !billingAddress) {
        return Response.json({ success: false, error: "All required fields must be provided" }, { status: 400 })
      }

      if (!validateText(accountName, 2, 100)) {
        return Response.json({ success: false, error: "Account name must be between 2 and 100 characters" }, { status: 400 })
      }

      if (!Array.isArray(items) || items.length === 0) {
        return Response.json({ success: false, error: "At least one order item is required" }, { status: 400 })
      }

      // Generate order number
      const orderNumber = `SO-${new Date().getFullYear()}-${String(mockSalesOrders.length + 1).padStart(3, '0')}`

      // Calculate total amount
      const totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)

      const newOrder: SalesOrder = {
        id: (mockSalesOrders.length + 1).toString(),
        orderNumber,
        accountId,
        accountName,
        accountCode,
        siteId,
        siteName,
        requestedShipDate,
        actualShipDate: orderData.actualShipDate,
        deliveryDate: orderData.deliveryDate,
        status: orderData.status || "Draft",
        priority: orderData.priority || "Normal",
        totalAmount,
        currency: orderData.currency || "PKR",
        specialInstructions: orderData.specialInstructions,
        items: items.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          drugId: item.drugId,
          drugName: item.drugName,
          drugCode: item.drugCode,
          batchPreference: item.batchPreference || "FEFO",
          preferredBatchId: item.preferredBatchId,
          preferredBatchNumber: item.preferredBatchNumber,
          quantity: Number(item.quantity),
          unit: item.unit,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.quantity) * Number(item.unitPrice),
          allocatedQuantity: 0,
          allocatedBatches: [],
          status: "Pending",
          remarks: item.remarks
        })),
        shippingAddress,
        billingAddress,
        createdBy: user.userId.toString(),
        createdByName: user.name || "Unknown User",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approvedBy: orderData.approvedBy,
        approvedByName: orderData.approvedByName,
        approvedAt: orderData.approvedAt,
        remarks: orderData.remarks
      }

      mockSalesOrders.push(newOrder)

      const response: DistributionAPIResponse<SalesOrder> = {
        success: true,
        data: newOrder,
        message: "Sales order created successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Create sales order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function PUT(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin", "sales_rep"])(request, async (req, user) => {
    try {
      const orderData = await request.json()
      const { id, ...updateData } = orderData

      const orderIndex = mockSalesOrders.findIndex((order) => order.id === id)
      if (orderIndex === -1) {
        return Response.json({ success: false, error: "Sales order not found" }, { status: 404 })
      }

      // Update order
      mockSalesOrders[orderIndex] = {
        ...mockSalesOrders[orderIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      const response: DistributionAPIResponse<SalesOrder> = {
        success: true,
        data: mockSalesOrders[orderIndex],
        message: "Sales order updated successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Update sales order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}

export async function DELETE(request: NextRequest) {
  return requireAuth(["system_admin", "org_admin"])(request, async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get("id")

      if (!id) {
        return Response.json({ success: false, error: "Sales order ID is required" }, { status: 400 })
      }

      const orderIndex = mockSalesOrders.findIndex((order) => order.id === id)
      if (orderIndex === -1) {
        return Response.json({ success: false, error: "Sales order not found" }, { status: 404 })
      }

      const deletedOrder = mockSalesOrders.splice(orderIndex, 1)[0]

      const response: DistributionAPIResponse<SalesOrder> = {
        success: true,
        data: deletedOrder,
        message: "Sales order deleted successfully",
      }

      return Response.json(response)
    } catch (error) {
      console.error("Delete sales order error:", error)
      return Response.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
  })
}
