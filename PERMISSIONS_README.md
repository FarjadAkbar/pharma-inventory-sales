# Permission System Documentation

## Overview

This application implements a comprehensive permission-based access control system that allows different user roles to access specific modules and screens based on their permissions.

## Permission Structure

### JWT Token Payload
The JWT token contains the following information:
```json
{
  "userId": 7,
  "clientId": 1,
  "storeId": 1,
  "role": "pos_staff",
  "iat": 1755858983,
  "exp": 1755862583
}
```

### Permission Object Structure
Permissions are organized by modules and screens:
```json
{
  "POS": {
    "pos_product": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true,
      "canAll": true
    },
    "pos_category": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": false,
      "canAll": false
    }
  },
  "PHARMA": {
    "pharma_product": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true,
      "canAll": true
    }
  },
  "USER_MANAGEMENT": {
    "users": {
      "canView": true,
      "canCreate": true,
      "canUpdate": true,
      "canDelete": true,
      "canAll": true
    }
  }
}
```

## User Roles

### POS Staff (`pos_staff`)
- **POS Module**: Full access to products, limited access to categories
- **Permissions**: Can view, create, update products; can view, create, update categories (no delete)

### Pharma Staff (`pharma_staff`)
- **PHARMA Module**: Limited access to products and categories
- **Permissions**: Can view, create, update products (no delete); can only view categories

### Client Admin (`client_admin`)
- **All Modules**: Full access to all features
- **Permissions**: Complete access to POS, PHARMA, and USER_MANAGEMENT modules

## Components

### PermissionGuard
Renders children only if user has the specified permission:
```tsx
<PermissionGuard module="POS" screen="pos_product" action="create">
  <Button>Add Product</Button>
</PermissionGuard>
```

### ModulePermissionGuard
Renders children only if user can view the screen:
```tsx
<ModulePermissionGuard module="POS" screen="pos_product">
  <ProductList />
</ModulePermissionGuard>
```

### useScreenPermissions Hook
Returns all permissions for a specific screen:
```tsx
const permissions = useScreenPermissions("POS", "pos_product")
// Returns: { canView, canCreate, canUpdate, canDelete, canAll, hasAnyPermission }
```

## Usage Examples

### Conditional Button Rendering
```tsx
<PermissionGuard module="POS" screen="pos_product" action="create">
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Add Product
  </Button>
</PermissionGuard>
```

### Conditional Section Rendering
```tsx
<ModulePermissionGuard module="PHARMA" screen="pharma_product">
  <PharmaProductSection />
</ModulePermissionGuard>
```

### Permission Checks in Components
```tsx
const { canCreate, canUpdate, canDelete } = useScreenPermissions("POS", "pos_product")

return (
  <div>
    {canCreate && <AddButton />}
    {canUpdate && <EditButton />}
    {canDelete && <DeleteButton />}
  </div>
)
```

## Sidebar Navigation

The sidebar automatically shows modules and screens based on user permissions:
- **Dashboard**: Always visible
- **POS**: Shows if user has any POS permissions
- **PHARMA**: Shows if user has any PHARMA permissions
- **USER_MANAGEMENT**: Shows if user has user management permissions

Each module can be expanded to show its screens, and only screens the user has permission to view are displayed.

## Environment Configuration

Create a `.env.local` file with:
```bash
NEXT_JWT_SECRET=your-super-secret-jwt-key-here
```

## Mock Data

Currently, the system uses mock permissions based on user roles. In production, these will come from the API response after login.

## Future Enhancements

1. **API Integration**: Replace mock data with real API calls
2. **Dynamic Permissions**: Allow admins to modify user permissions
3. **Permission Caching**: Cache permissions for better performance
4. **Audit Logging**: Track permission-based actions
5. **Role Templates**: Predefined permission sets for common roles

## Testing

Visit `/dashboard/permissions-demo` to see the permission system in action with different user roles.
