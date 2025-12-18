# Phase 17: Sites and Suppliers API Integration

## Status: 🔄 Ready for Implementation

## Overview
This phase outlines the detailed steps for integrating the frontend sites and suppliers functionality with the backend API, ensuring proper CRUD operations and permission-based access control.

## 17.1 Permission System

### 17.1.1 System Administrator Permissions
- **Empty permissions object `{}`** means the user has **ALL permissions**
- System Administrators can perform all actions without specific permission checks
- Permission structure: `permissions: {}` = Full access

### 17.1.2 Permission Guard Implementation
The `PermissionGuard` component should check:
1. If `permissions` is empty `{}` → Allow access (System Administrator)
2. If specific permissions exist → Check module/screen/action combination
3. Current implementation: `module="MASTER_DATA" screen="sites" action="create|update|delete|read"`

## 17.2 Sites API Integration

### 17.2.1 Add Site Functionality

#### Permission Check
```tsx
<PermissionGuard module="MASTER_DATA" screen="sites" action="create">
  <Button onClick={() => (window.location.href = "/dashboard/sites/new")}>
    <Plus />
    Add Site
  </Button>
</PermissionGuard>
```

#### Form Fields
- **Name**: Text input (required)
- **Location**: Text input (required)

#### API Endpoint
- **Method**: `POST`
- **URL**: `/site`
- **Payload**:
```json
{
  "name": "Site A",
  "location": "123 Main St, City, Country"
}
```

#### Response Handling
- Success: Redirect to sites list and refresh data
- Error: Display error message to user

### 17.2.2 Fetch All Sites

#### API Endpoint
- **Method**: `GET`
- **URL**: `/site/getAllSites`

#### Response Format
```json
{
  "status": true,
  "data": [
    {
      "id": 1,
      "name": "Pharma",
      "location": "Clifton",
      "created_by": null,
      "updated_by": null,
      "created_at": "2025-09-24T09:49:04.000Z",
      "updated_at": "2025-09-24T09:49:04.000Z"
    },
    {
      "id": 2,
      "name": "Pharma",
      "location": "Nazimabad",
      "created_by": null,
      "updated_by": null,
      "created_at": "2025-09-24T09:49:04.000Z",
      "updated_at": "2025-09-24T09:49:04.000Z"
    },
    {
      "id": 4,
      "name": "Site A",
      "location": "123 Main St, City, Country",
      "created_by": null,
      "updated_by": null,
      "created_at": "2025-10-05T08:52:18.000Z",
      "updated_at": "2025-10-05T08:52:18.000Z"
    }
  ]
}
```

#### Implementation Notes
- Call this API on component mount
- Refresh data after any CRUD operation
- Handle loading states appropriately

### 17.2.3 Get Single Site (for Edit)

#### API Endpoint
- **Method**: `GET`
- **URL**: `/site/{id}`

#### Response Format
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "Pharma",
    "location": "Clifton",
    "created_by": null,
    "updated_by": null,
    "created_at": "2025-09-24T09:49:04.000Z",
    "updated_at": "2025-09-24T09:49:04.000Z"
  }
}
```

#### Implementation Notes
- Use this API to populate edit form with existing data
- Call when navigating to edit page with site ID

### 17.2.4 Update Site

#### Permission Check
```tsx
<PermissionGuard module="MASTER_DATA" screen="sites" action="update">
  <Button variant="ghost" size="sm" onClick={() => handleEdit(site)}>
    Edit
  </Button>
</PermissionGuard>
```

#### API Endpoint
- **Method**: `PUT`
- **URL**: `/site/{id}`
- **Payload**:
```json
{
  "name": "Site A",
  "location": "123 Main St, City, Country"
}
```

#### Response Format
```json
{
  "status": true,
  "message": "Site updated successfully"
}
```

#### Implementation Notes
- Use same form as Add Site but pre-populated with existing data
- On save, call update API and refresh the sites list
- Show success/error messages appropriately

### 17.2.5 Delete Site

#### Permission Check
```tsx
<PermissionGuard module="MASTER_DATA" screen="sites" action="delete">
  <Button variant="ghost" size="sm" onClick={() => handleDelete(site)}>
    Delete
  </Button>
</PermissionGuard>
```

#### Confirmation Flow
1. Show confirmation dialog: "Are you sure you want to delete site '{site.name}'?"
2. If user confirms → Call delete API
3. If user cancels → Do nothing

#### API Endpoint
- **Method**: `DELETE`
- **URL**: `/site/{id}`

#### Response Format
```json
{
  "status": true,
  "message": "Site deleted successfully"
}
```

#### Implementation Notes
- After successful deletion, refresh the sites list
- Handle errors gracefully with user feedback

## 17.3 Frontend Implementation

### 17.3.1 Update Site Interface
Modify the `Site` interface in `frontend/types/sites.ts` to match API response:
```typescript
export interface Site {
  id: number
  name: string
  location: string
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
}

export interface CreateSiteData {
  name: string
  location: string
}

export interface UpdateSiteData {
  name: string
  location: string
}
```

### 17.3.2 API Service Methods
Add sites CRUD methods to `frontend/services/api.service.ts`:
```typescript
// Sites CRUD operations
async getSites(): Promise<ApiResponse<Site[]>> {
  return this.request('/site/getAllSites')
}

async getSite(id: number): Promise<ApiResponse<Site>> {
  return this.request(`/site/${id}`)
}

async createSite(data: CreateSiteData): Promise<ApiResponse<Site>> {
  return this.request('/site', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

async updateSite(id: number, data: UpdateSiteData): Promise<ApiResponse<void>> {
  return this.request(`/site/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

async deleteSite(id: number): Promise<ApiResponse<void>> {
  return this.request(`/site/${id}`, {
    method: 'DELETE'
  })
}
```

### 17.3.3 Sites Page Updates
Update `frontend/app/dashboard/sites/page.tsx`:

#### Update Site Interface
```typescript
interface Site {
  id: number
  name: string
  location: string
  created_by: number | null
  updated_by: number | null
  created_at: string
  updated_at: string
}
```

#### Update fetchSites Method
```typescript
const fetchSites = async () => {
  try {
    setLoading(true)
    const response = await apiService.getSites()

    if (response.status && response.data) {
      setSites(response.data)
      setPagination({ page: 1, pages: 1, total: response.data.length })
    }
  } catch (error) {
    console.error("Failed to fetch sites:", error)
  } finally {
    setLoading(false)
  }
}
```

#### Update handleDelete Method
```typescript
const handleDelete = async (site: Site) => {
  if (confirm(`Are you sure you want to delete site "${site.name}"?`)) {
    try {
      await apiService.deleteSite(site.id)
      fetchSites() // Refresh the list
    } catch (error) {
      console.error("Failed to delete site:", error)
    }
  }
}
```

### 17.3.4 Create Add/Edit Site Form Component
Create `frontend/components/sites/site-form.tsx`:
```typescript
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/services/api.service"
import type { Site, CreateSiteData, UpdateSiteData } from "@/types/sites"

interface SiteFormProps {
  siteId?: number
  onSuccess: () => void
  onCancel: () => void
}

export function SiteForm({ siteId, onSuccess, onCancel }: SiteFormProps) {
  const [formData, setFormData] = useState<CreateSiteData>({
    name: "",
    location: ""
  })
  const [loading, setLoading] = useState(false)
  const [isEdit, setIsEdit] = useState(!!siteId)

  useEffect(() => {
    if (siteId) {
      fetchSite()
    }
  }, [siteId])

  const fetchSite = async () => {
    if (!siteId) return
    
    try {
      const response = await apiService.getSite(siteId)
      if (response.status && response.data) {
        setFormData({
          name: response.data.name,
          location: response.data.location
        })
      }
    } catch (error) {
      console.error("Failed to fetch site:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.location.trim()) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      if (isEdit && siteId) {
        await apiService.updateSite(siteId, formData)
      } else {
        await apiService.createSite(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save site:", error)
      alert("Failed to save site. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Site" : "Add New Site"}</CardTitle>
        <CardDescription>
          {isEdit ? "Update site information" : "Enter site details"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Site Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter site name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter site location"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : (isEdit ? "Update Site" : "Create Site")}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
```

### 17.3.5 Create Add Site Page
Create `frontend/app/dashboard/sites/new/page.tsx`:
```typescript
"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SiteForm } from "@/components/sites/site-form"

export default function NewSitePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/sites")
  }

  const handleCancel = () => {
    router.push("/dashboard/sites")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Site</h1>
          <p className="text-muted-foreground">Create a new site for your organization</p>
        </div>
        
        <SiteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}
```

### 17.3.6 Create Edit Site Page
Create `frontend/app/dashboard/sites/[id]/page.tsx`:
```typescript
"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SiteForm } from "@/components/sites/site-form"

interface EditSitePageProps {
  params: {
    id: string
  }
}

export default function EditSitePage({ params }: EditSitePageProps) {
  const router = useRouter()
  const siteId = parseInt(params.id)

  const handleSuccess = () => {
    router.push("/dashboard/sites")
  }

  const handleCancel = () => {
    router.push("/dashboard/sites")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Site</h1>
          <p className="text-muted-foreground">Update site information</p>
        </div>
        
        <SiteForm siteId={siteId} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </DashboardLayout>
  )
}
```

## 17.4 Data Table Integration

### 17.4.1 Update Columns Configuration
Update the columns configuration in the sites page to match the new API response:
```typescript
const columns = [
  {
    key: "name",
    header: "Site Name",
    sortable: true,
    render: (site: Site) => (
      <div className="font-medium">{site.name}</div>
    ),
  },
  {
    key: "location",
    header: "Location",
    sortable: true,
    render: (site: Site) => (
      <div className="text-sm text-muted-foreground">{site.location}</div>
    ),
  },
  {
    key: "created_at",
    header: "Created",
    sortable: true,
    render: (site: Site) => (
      <div className="text-sm text-muted-foreground">
        {new Date(site.created_at).toLocaleDateString()}
      </div>
    ),
  },
  {
    key: "updated_at",
    header: "Last Updated",
    sortable: true,
    render: (site: Site) => (
      <div className="text-sm text-muted-foreground">
        {new Date(site.updated_at).toLocaleDateString()}
      </div>
    ),
  },
]
```

### 17.4.2 Update Actions Configuration
Update the actions configuration to use the new API methods:
```typescript
const actions = (site: Site) => (
  <div className="flex items-center gap-2">
    <PermissionGuard module="MASTER_DATA" screen="sites" action="update">
      <Button variant="ghost" size="sm" onClick={() => handleEdit(site)}>
        Edit
      </Button>
    </PermissionGuard>
    <PermissionGuard module="MASTER_DATA" screen="sites" action="delete">
      <Button variant="ghost" size="sm" onClick={() => handleDelete(site)}>
        Delete
      </Button>
    </PermissionGuard>
  </div>
)
```

## 17.5 Error Handling

### 17.5.1 API Error Responses
Handle different types of errors:
- Network errors
- Validation errors
- Authentication errors
- Server errors

### 17.5.2 User Feedback
- Show loading indicators during API calls
- Display success/error messages
- Disable buttons during operations
- Provide clear error messages

## 17.6 Testing Requirements

### 17.6.1 Unit Tests
- Test permission checks for different user roles
- Test API service methods
- Test form validation
- Test error handling

### 17.6.2 Integration Tests
- Test complete CRUD flow
- Test permission-based UI rendering
- Test error handling scenarios
- Test form submission and validation

## 17.7 Implementation Checklist

- [ ] **Update Site Interface**: Modify to match API response structure
- [ ] **API Service Methods**: Implement sites CRUD operations
- [ ] **Site Form Component**: Create reusable Add/Edit form
- [ ] **Add Site Page**: Create new site creation page
- [ ] **Edit Site Page**: Create site editing page
- [ ] **Update Sites Page**: Integrate with new API endpoints
- [ ] **Permission Integration**: Ensure all actions respect permission system
- [ ] **Error Handling**: Implement proper error handling and user feedback
- [ ] **Loading States**: Add loading indicators for better UX
- [ ] **Testing**: Test all CRUD operations and permission checks

## 17.8 Future Considerations

### 17.8.1 Suppliers Integration
- Similar CRUD operations for suppliers
- Permission-based access control
- Data table integration
- Form components

### 17.8.2 Additional Features
- Bulk operations
- Export functionality
- Advanced filtering
- Audit trail
- Site hierarchy management

## Next Steps

After completing Phase 17, the sites functionality will be fully integrated with the backend API, providing complete CRUD operations with proper permission handling and user-friendly interfaces.
