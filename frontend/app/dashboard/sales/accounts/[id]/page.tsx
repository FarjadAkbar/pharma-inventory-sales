"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AccountForm } from "@/components/sales/account-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { salesCrmApi } from "@/services/sales-crm-api.service"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Building2, Phone, Mail, MapPin, DollarSign, Calendar } from "lucide-react"

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const accountId = params.id as string
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    fetchAccount()
  }, [accountId])

  const fetchAccount = async () => {
    try {
      setLoading(true)
      const response = await salesCrmApi.getAccount(accountId)
      if (response.success && response.data) {
        setAccount(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch account:", error)
      toast.error("Failed to fetch account details")
    } finally {
      setLoading(false)
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "distributor":
        return "bg-orange-100 text-orange-800"
      case "partner":
        return "bg-purple-100 text-purple-800"
      case "vendor":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  if (!account) {
    return (
      <DashboardLayout>
        <div>Account not found</div>
      </DashboardLayout>
    )
  }

  if (showEdit) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Account</h1>
            <p className="text-muted-foreground">Update account information</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update the account details below</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountForm
                accountId={accountId}
                onSuccess={() => {
                  setShowEdit(false)
                  fetchAccount()
                }}
              />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.accountName}</h1>
            <p className="text-muted-foreground">{account.accountNumber}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getTypeBadgeColor(account.type)}>
              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
            </Badge>
            <Badge className={getStatusBadgeColor(account.status)}>
              {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Code</label>
                <p className="text-lg">{account.accountCode}</p>
              </div>
              {account.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{account.phone}</span>
                </div>
              )}
              {account.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{account.email}</span>
                </div>
              )}
              {account.creditLimit && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${account.creditLimit.toLocaleString()}</span>
                </div>
              )}
              {account.paymentTerms && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Terms</label>
                  <p>{account.paymentTerms}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {account.billingAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Billing Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p>{account.billingAddress.street}</p>
                      <p>{account.billingAddress.city}, {account.billingAddress.state}</p>
                      <p>{account.billingAddress.postalCode}, {account.billingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
              {account.shippingAddress && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shipping Address</label>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <p>{account.shippingAddress.street}</p>
                      <p>{account.shippingAddress.city}, {account.shippingAddress.state}</p>
                      <p>{account.shippingAddress.postalCode}, {account.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {account.notes && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{account.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowEdit(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Edit Account
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
