"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { salesCrmApi } from "@/services/sales-crm-api.service"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AccountFormProps {
  accountId?: string
  onSuccess?: () => void
}

export function AccountForm({ accountId, onSuccess }: AccountFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    accountName: "",
    accountCode: "",
    type: "customer" as "customer" | "distributor" | "partner" | "vendor",
    status: "active" as "active" | "inactive" | "suspended" | "closed",
    phone: "",
    email: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      contactPerson: "",
      phone: "",
      email: "",
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      contactPerson: "",
      phone: "",
      email: "",
    },
    creditLimit: "",
    paymentTerms: "",
    assignedSalesRep: "",
    taxId: "",
    registrationNumber: "",
    notes: "",
    tags: "",
  })

  useEffect(() => {
    if (accountId) {
      fetchAccount()
    }
  }, [accountId])

  const fetchAccount = async () => {
    try {
      const response = await salesCrmApi.getAccount(accountId!)
      if (response.success && response.data) {
        const account = response.data
        setFormData({
          accountName: account.accountName || "",
          accountCode: account.accountCode || "",
          type: account.type || "customer",
          status: account.status || "active",
          phone: account.phone || "",
          email: account.email || "",
          billingAddress: account.billingAddress || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            contactPerson: "",
            phone: "",
            email: "",
          },
          shippingAddress: account.shippingAddress || {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            contactPerson: "",
            phone: "",
            email: "",
          },
          creditLimit: account.creditLimit?.toString() || "",
          paymentTerms: account.paymentTerms || "",
          assignedSalesRep: account.assignedSalesRep?.toString() || "",
          taxId: account.taxId || "",
          registrationNumber: account.registrationNumber || "",
          notes: account.notes || "",
          tags: account.tags?.join(", ") || "",
        })
      }
    } catch (error) {
      console.error("Failed to fetch account:", error)
      toast.error("Failed to fetch account details")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload: any = {
        accountName: formData.accountName,
        accountCode: formData.accountCode,
        type: formData.type,
        status: formData.status,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        billingAddress: Object.values(formData.billingAddress).some(v => v) ? formData.billingAddress : undefined,
        shippingAddress: Object.values(formData.shippingAddress).some(v => v) ? formData.shippingAddress : undefined,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : undefined,
        paymentTerms: formData.paymentTerms || undefined,
        assignedSalesRep: formData.assignedSalesRep ? parseInt(formData.assignedSalesRep) : undefined,
        taxId: formData.taxId || undefined,
        registrationNumber: formData.registrationNumber || undefined,
        notes: formData.notes || undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(t => t) : undefined,
        createdBy: 1, // TODO: Get from auth context
      }

      if (accountId) {
        await salesCrmApi.updateAccount(accountId, payload)
        toast.success("Account updated successfully")
      } else {
        await salesCrmApi.createAccount(payload)
        toast.success("Account created successfully")
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard/sales/accounts")
      }
    } catch (error: any) {
      console.error("Failed to save account:", error)
      toast.error(error.message || "Failed to save account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="accountName">Account Name *</Label>
          <Input
            id="accountName"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountCode">Account Code *</Label>
          <Input
            id="accountCode"
            value={formData.accountCode}
            onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData({ ...formData, status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Input
            id="paymentTerms"
            value={formData.paymentTerms}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billingStreet">Street</Label>
            <Input
              id="billingStreet"
              value={formData.billingAddress.street}
              onChange={(e) => setFormData({
                ...formData,
                billingAddress: { ...formData.billingAddress, street: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCity">City</Label>
            <Input
              id="billingCity"
              value={formData.billingAddress.city}
              onChange={(e) => setFormData({
                ...formData,
                billingAddress: { ...formData.billingAddress, city: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingState">State</Label>
            <Input
              id="billingState"
              value={formData.billingAddress.state}
              onChange={(e) => setFormData({
                ...formData,
                billingAddress: { ...formData.billingAddress, state: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingPostalCode">Postal Code</Label>
            <Input
              id="billingPostalCode"
              value={formData.billingAddress.postalCode}
              onChange={(e) => setFormData({
                ...formData,
                billingAddress: { ...formData.billingAddress, postalCode: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCountry">Country</Label>
            <Input
              id="billingCountry"
              value={formData.billingAddress.country}
              onChange={(e) => setFormData({
                ...formData,
                billingAddress: { ...formData.billingAddress, country: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Shipping Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shippingStreet">Street</Label>
            <Input
              id="shippingStreet"
              value={formData.shippingAddress.street}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, street: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCity">City</Label>
            <Input
              id="shippingCity"
              value={formData.shippingAddress.city}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, city: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingState">State</Label>
            <Input
              id="shippingState"
              value={formData.shippingAddress.state}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, state: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingPostalCode">Postal Code</Label>
            <Input
              id="shippingPostalCode"
              value={formData.shippingAddress.postalCode}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, postalCode: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingCountry">Country</Label>
            <Input
              id="shippingCountry"
              value={formData.shippingAddress.country}
              onChange={(e) => setFormData({
                ...formData,
                shippingAddress: { ...formData.shippingAddress, country: e.target.value }
              })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="tag1, tag2, tag3"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : accountId ? "Update Account" : "Create Account"}
        </Button>
      </div>
    </form>
  )
}
