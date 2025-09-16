"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormInput, FormSelect, FormTextarea, FormActions } from "@/components/ui/form"
import { useFormState } from "@/lib/api-response"
import { useFormValidation, commonValidationRules } from "@/lib/form-validation"
import { apiService } from "@/services/api.service"

interface Product {
  id?: string
  name: string
  description: string
  sku: string
  categoryId: string
  vendorId: string
  price: number
  cost: number
  stock: number
  minStock: number
  maxStock: number
  isActive: boolean
}

interface Category {
  id: string
  name: string
}

interface Vendor {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: Partial<Product>
  onSubmit: (data: Product) => Promise<void>
  submitLabel?: string
  onCancel?: () => void
}

export function ProductForm({ initialData, onSubmit, submitLabel = "Save", onCancel }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  
  const initialFormData: Product = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    sku: initialData?.sku || "",
    categoryId: initialData?.categoryId || "",
    vendorId: initialData?.vendorId || "",
    price: initialData?.price || 0,
    cost: initialData?.cost || 0,
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 0,
    maxStock: initialData?.maxStock || 0,
    isActive: initialData?.isActive ?? true,
  }

  const formState = useFormState(initialFormData)
  const validation = useFormValidation({
    ...commonValidationRules,
    sku: {
      required: true,
      minLength: 3,
      maxLength: 50,
      pattern: /^[A-Z0-9_-]+$/,
      message: "SKU must be 3-50 characters, uppercase letters, numbers, hyphens, and underscores only"
    },
    categoryId: {
      required: true,
      message: "Please select a category"
    },
    vendorId: {
      required: true,
      message: "Please select a vendor"
    },
    price: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return "Price must be a non-negative number"
        }
        return null
      }
    },
    cost: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return "Cost must be a non-negative number"
        }
        return null
      }
    },
    stock: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return "Stock must be a non-negative number"
        }
        return null
      }
    },
    minStock: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return "Minimum stock must be a non-negative number"
        }
        return null
      }
    },
    maxStock: {
      required: true,
      custom: (value) => {
        const num = Number(value)
        if (isNaN(num) || num < 0) {
          return "Maximum stock must be a non-negative number"
        }
        if (num <= formState.data.minStock) {
          return "Maximum stock must be greater than minimum stock"
        }
        return null
      }
    }
  })

  // Load categories and vendors on mount
  useState(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, vendorsRes] = await Promise.all([
          apiService.getProducts({ limit: 1000 }), // This should be getCategories
          apiService.getVendors({ limit: 1000 })
        ])
        
        // Mock data for now - replace with actual API calls
        setCategories([
          { id: "1", name: "Medicines" },
          { id: "2", name: "Supplies" },
          { id: "3", name: "Equipment" }
        ])
        
        setVendors([
          { id: "1", name: "PharmaCorp" },
          { id: "2", name: "MedSupply Inc" },
          { id: "3", name: "HealthTech Ltd" }
        ])
      } catch (error) {
        console.error("Failed to load form data:", error)
      }
    }
    
    loadData()
  })

  const handleSubmit = async (data: any) => {
    formState.setLoading(true)
    formState.clearErrors()
    
    try {
      // Validate form
      const errors = validation.validateForm(data)
      if (validation.hasErrors()) {
        formState.setErrors(errors)
        return
      }

      const productData: Product = {
        name: data.name,
        description: data.description,
        sku: data.sku,
        categoryId: data.categoryId,
        vendorId: data.vendorId,
        price: Number(data.price),
        cost: Number(data.cost),
        stock: Number(data.stock),
        minStock: Number(data.minStock),
        maxStock: Number(data.maxStock),
        isActive: data.isActive === "true" || data.isActive === true,
      }

      await onSubmit(productData)
      formState.setSuccess("Product saved successfully")
    } catch (error: any) {
      formState.setError(error.message || "Failed to save product")
    } finally {
      formState.setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form 
          onSubmit={handleSubmit} 
          loading={formState.isLoading}
          error={formState.error}
          success={formState.success}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="name"
              label="Product Name"
              value={formState.data.name}
              onChange={(e) => formState.updateField('name', e.target.value)}
              error={formState.errors.name}
              required
            />
            <FormInput
              name="sku"
              label="SKU"
              value={formState.data.sku}
              onChange={(e) => formState.updateField('sku', e.target.value.toUpperCase())}
              error={formState.errors.sku}
              required
              placeholder="e.g., PROD-001"
            />
          </div>

          <FormTextarea
            name="description"
            label="Description"
            value={formState.data.description}
            onChange={(e) => formState.updateField('description', e.target.value)}
            error={formState.errors.description}
            rows={3}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <FormSelect
              name="categoryId"
              label="Category"
              value={formState.data.categoryId}
              onChange={(e) => formState.updateField('categoryId', e.target.value)}
              error={formState.errors.categoryId}
              required
              options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
              placeholder="Select a category"
            />
            <FormSelect
              name="vendorId"
              label="Vendor"
              value={formState.data.vendorId}
              onChange={(e) => formState.updateField('vendorId', e.target.value)}
              error={formState.errors.vendorId}
              required
              options={vendors.map(vendor => ({ value: vendor.id, label: vendor.name }))}
              placeholder="Select a vendor"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FormInput
              name="price"
              label="Price"
              type="number"
              step="0.01"
              min="0"
              value={formState.data.price}
              onChange={(e) => formState.updateField('price', e.target.value)}
              error={formState.errors.price}
              required
            />
            <FormInput
              name="cost"
              label="Cost"
              type="number"
              step="0.01"
              min="0"
              value={formState.data.cost}
              onChange={(e) => formState.updateField('cost', e.target.value)}
              error={formState.errors.cost}
              required
            />
            <FormInput
              name="stock"
              label="Current Stock"
              type="number"
              min="0"
              value={formState.data.stock}
              onChange={(e) => formState.updateField('stock', e.target.value)}
              error={formState.errors.stock}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              name="minStock"
              label="Minimum Stock"
              type="number"
              min="0"
              value={formState.data.minStock}
              onChange={(e) => formState.updateField('minStock', e.target.value)}
              error={formState.errors.minStock}
              required
            />
            <FormInput
              name="maxStock"
              label="Maximum Stock"
              type="number"
              min="0"
              value={formState.data.maxStock}
              onChange={(e) => formState.updateField('maxStock', e.target.value)}
              error={formState.errors.maxStock}
              required
            />
          </div>

          <FormSelect
            name="isActive"
            label="Status"
            value={formState.data.isActive.toString()}
            onChange={(e) => formState.updateField('isActive', e.target.value === "true")}
            error={formState.errors.isActive}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" }
            ]}
          />

          <FormActions 
            loading={formState.isLoading}
            submitLabel={submitLabel}
            onCancel={onCancel}
          />
        </Form>
      </CardContent>
    </Card>
  )
}
