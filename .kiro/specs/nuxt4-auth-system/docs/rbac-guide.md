# RBAC (Role-Based Access Control) Guide

## Overview

This guide provides comprehensive documentation for the enhanced RBAC system in the Nuxt 4 authentication framework. The system supports both role-based and permission-based access control with advanced features like resource-based permissions, role hierarchy, and detailed access checking.

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Permission System](#permission-system)
3. [Role System](#role-system)
4. [Middleware Usage](#middleware-usage)
5. [useRBAC Composable](#userbac-composable)
6. [Page Protection](#page-protection)
7. [Resource-Based Access Control](#resource-based-access-control)
8. [Advanced Features](#advanced-features)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Core Concepts

### Authentication vs Authorization

- **Authentication**: Verifying who the user is (handled by auth middleware)
- **Authorization**: Determining what the user can do (handled by permission middleware and RBAC)

### Permission-Based vs Role-Based

- **Permission-Based**: Direct assignment of specific permissions to users
- **Role-Based**: Assignment of roles that contain multiple permissions
- **Hybrid Approach**: Users can have both direct permissions and role-based permissions

## Permission System

### Permission Structure

Permissions follow a hierarchical dot notation pattern:

```typescript
// Resource-based permissions
"users.view"; // View users
"users.create"; // Create new users
"users.edit"; // Edit existing users
"users.delete"; // Delete users
"users.manage"; // Full management (includes all above)

// System permissions
"system.admin"; // System administration
"system.settings"; // System settings
"system.backup"; // Backup operations
```

### Available Permissions

#### User Management

- `users.view` - View user list and details
- `users.create` - Create new users
- `users.edit` - Edit user information
- `users.delete` - Delete users
- `users.manage` - Full user management

#### Group Management

- `groups.view` - View groups
- `groups.create` - Create new groups
- `groups.edit` - Edit group information
- `groups.delete` - Delete groups
- `groups.manage` - Full group management

#### Order Management

- `orders.view` - View orders
- `orders.create` - Create new orders
- `orders.edit` - Edit order information
- `orders.delete` - Delete orders
- `orders.manage` - Full order management

#### Bank Management

- `banks.view` - View bank information
- `banks.create` - Add new banks
- `banks.edit` - Edit bank details
- `banks.delete` - Remove banks
- `banks.manage` - Full bank management

#### Reports

- `reports.view` - View reports
- `reports.export` - Export reports
- `reports.manage` - Full report management

#### System Administration

- `system.settings` - Access system settings
- `system.backup` - Perform backups
- `system.logs` - View system logs
- `system.admin` - Full system administration

## Role System

### Standard Roles

#### User

- Basic authenticated user
- Limited permissions based on specific assignments

#### Manager

- Supervisory role with extended permissions
- Can manage users and view reports
- Inherits all user permissions

#### Admin

- Administrative role with broad permissions
- Can manage system settings and users
- Inherits all manager and user permissions

#### Super Admin

- Highest level role with all permissions
- Can perform any action in the system
- Inherits all other role permissions

### Role Hierarchy

```typescript
const ROLE_HIERARCHY = {
  super_admin: ["admin", "manager", "user"],
  admin: ["manager", "user"],
  manager: ["user"],
  user: [],
};
```

## Middleware Usage

### Auth Middleware

Protects routes requiring authentication:

```typescript
// pages/dashboard.vue
<script setup>
definePageMeta({
  middleware: ['auth']
})
</script>
```

### Permission Middleware

Protects routes requiring specific permissions:

```typescript
// pages/users/index.vue
<script setup>
definePageMeta({
  middleware: ['auth', 'permission'],
  permission: 'users.view'
})
</script>
```

### Multiple Permissions

#### All Permissions Required (AND logic)

```typescript
<script setup>
definePageMeta({
  middleware: ['auth', 'permission'],
  permissions: ['users.view', 'users.edit'],
  permissionMode: 'all' // Default
})
</script>
```

#### Any Permission Required (OR logic)

```typescript
<script setup>
definePageMeta({
  middleware: ['auth', 'permission'],
  permissions: ['users.view', 'groups.view'],
  permissionMode: 'any'
})
</script>
```

### Role-Based Protection

```typescript
// Using custom middleware for role checking
<script setup>
definePageMeta({
  middleware: ['auth', (to) => {
    const { hasRole } = useRBAC()
    if (!hasRole('admin')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
  }]
})
</script>
```

## useRBAC Composable

### Basic Usage

```typescript
<script setup>
  const rbac = useRBAC() // Check permissions const canViewUsers =
  rbac.hasPermission('users.view') const canManageUsers =
  rbac.hasAllPermissions(['users.view', 'users.edit']) // Check roles const
  isAdmin = rbac.hasRole('admin') const isManagerOrAdmin =
  rbac.hasAnyRole(['manager', 'admin'])
</script>
```

### Reactive State

```typescript
<script setup>
const rbac = useRBAC()

// Reactive user data
const currentUser = rbac.currentUser
const userPermissions = rbac.userPermissions
const userRoles = rbac.userRoles
const isAuthenticated = rbac.isAuthenticated
</script>

<template>
  <div v-if="isAuthenticated">
    <h1>Welcome, {{ currentUser?.name }}</h1>
    <p>Roles: {{ userRoles.join(', ') }}</p>
    <p>Permissions: {{ userPermissions.length }}</p>
  </div>
</template>
```

### Advanced Permission Checking

```typescript
<script setup>
const rbac = useRBAC()

// Detailed permission check
const permissionResult = rbac.checkPermissions(['users.view', 'users.edit'], 'all')
console.log(permissionResult)
// {
//   hasAccess: true,
//   missingPermissions: [],
//   userPermissions: ['users.view', 'users.edit', 'users.delete'],
//   requiredPermissions: ['users.view', 'users.edit'],
//   accessLevel: 'write'
// }

// Detailed role check
const roleResult = rbac.checkRoles(['admin', 'manager'], 'any')
console.log(roleResult)
// {
//   hasRole: true,
//   missingRoles: [],
//   userRoles: ['admin'],
//   requiredRoles: ['admin', 'manager']
// }
</script>
```

## Page Protection

### Simple Permission Protection

```vue
<!-- pages/users/index.vue -->
<script setup>
definePageMeta({
  middleware: ["auth", "permission"],
  permission: "users.view",
});

const rbac = useRBAC();
</script>

<template>
  <div>
    <h1>Users Management</h1>

    <!-- Show create button only if user can create -->
    <v-btn
      v-if="rbac.hasPermission('users.create')"
      color="primary"
      @click="createUser"
    >
      Create User
    </v-btn>

    <!-- User list -->
    <UserList />
  </div>
</template>
```

### Complex Permission Logic

```vue
<!-- pages/users/[id]/edit.vue -->
<script setup>
const route = useRoute();
const rbac = useRBAC();

definePageMeta({
  middleware: ["auth", "permission"],
  permissions: ["users.edit", "users.manage"],
  permissionMode: "any",
});

// Additional checks
const canEditThisUser = computed(() => {
  const userId = route.params.id;
  const currentUserId = rbac.currentUser.value?.id;

  // Users can edit themselves, or admins can edit anyone
  return userId === currentUserId || rbac.hasPermission("users.manage");
});
</script>

<template>
  <div>
    <h1>Edit User</h1>

    <div v-if="canEditThisUser">
      <UserEditForm />
    </div>

    <div v-else>
      <v-alert type="warning">
        You don't have permission to edit this user.
      </v-alert>
    </div>
  </div>
</template>
```

## Resource-Based Access Control

### Access Levels

The system supports four access levels for resources:

- `none` - No access
- `read` - View only
- `write` - Create, edit, delete
- `admin` - Full management including advanced operations

### Using Access Levels

```typescript
<script setup>
const rbac = useRBAC()

// Get access level for users resource
const userAccessLevel = rbac.getAccessLevel('users')

// Check specific actions
const canViewUsers = rbac.canPerformAction('users', 'view')
const canCreateUsers = rbac.canPerformAction('users', 'create')
const canManageUsers = rbac.canPerformAction('users', 'manage')
</script>

<template>
  <div>
    <h2>Users ({{ userAccessLevel }} access)</h2>

    <v-btn v-if="canViewUsers" @click="viewUsers">View Users</v-btn>
    <v-btn v-if="canCreateUsers" @click="createUser">Create User</v-btn>
    <v-btn v-if="canManageUsers" @click="manageUsers">Manage Users</v-btn>
  </div>
</template>
```

### Resource Configuration

```typescript
// Available resources and their permissions
const RESOURCE_PATTERNS = {
  users: {
    view: "users.view",
    create: "users.create",
    edit: "users.edit",
    delete: "users.delete",
    manage: "users.manage",
  },
  orders: {
    view: "orders.view",
    create: "orders.create",
    edit: "orders.edit",
    delete: "orders.delete",
    manage: "orders.manage",
  },
  // ... other resources
};
```

## Advanced Features

### Role Hierarchy

```typescript
<script setup>
  const rbac = useRBAC() // Check if user has role or higher in hierarchy const
  hasManagerAccess = rbac.hasRoleOrHigher('manager') // Returns true if user has
  'manager', 'admin', or 'super_admin' // Get highest role const highestRole =
  rbac.getHighestRole() console.log(highestRole) // 'admin', 'manager', etc.
</script>
```

### User Access Summary

```typescript
<script setup>
const rbac = useRBAC()

// Get comprehensive access summary
const accessSummary = rbac.getUserAccessSummary()
console.log(accessSummary)
// {
//   userId: 123,
//   username: 'john_doe',
//   permissions: ['users.view', 'users.edit'],
//   roles: ['manager'],
//   isAuthenticated: true,
//   accessLevels: {
//     users: 'write',
//     orders: 'read',
//     system: 'none'
//   }
// }
</script>
```

### Conditional UI Rendering

```vue
<template>
  <div>
    <!-- Navigation based on permissions -->
    <v-navigation-drawer>
      <v-list>
        <v-list-item v-if="rbac.hasPermission('users.view')" to="/users">
          Users
        </v-list-item>

        <v-list-item v-if="rbac.hasPermission('orders.view')" to="/orders">
          Orders
        </v-list-item>

        <v-list-item v-if="rbac.isAdmin()" to="/admin">
          Administration
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Action buttons based on access level -->
    <v-card>
      <v-card-actions>
        <v-btn
          v-if="rbac.getAccessLevel('users') !== 'none'"
          @click="viewUsers"
        >
          View
        </v-btn>

        <v-btn
          v-if="rbac.getAccessLevel('users') === 'write'"
          @click="editUser"
        >
          Edit
        </v-btn>

        <v-btn
          v-if="rbac.getAccessLevel('users') === 'admin'"
          @click="deleteUser"
          color="error"
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
```

## Best Practices

### 1. Principle of Least Privilege

Grant users only the minimum permissions necessary for their role:

```typescript
// Good: Specific permissions
const permissions = ["users.view", "users.edit"];

// Avoid: Overly broad permissions
const permissions = ["users.manage", "system.admin"];
```

### 2. Use Middleware for Route Protection

Always use middleware for page-level protection:

```typescript
// Good: Middleware protection
definePageMeta({
  middleware: ["auth", "permission"],
  permission: "users.view",
});

// Avoid: Only component-level checks
const canAccess = rbac.hasPermission("users.view");
```

### 3. Combine Role and Permission Checks

Use both roles and permissions for flexible access control:

```typescript
// Good: Flexible checking
const canAccess = rbac.hasRole("admin") || rbac.hasPermission("users.manage");

// Limited: Only role-based
const canAccess = rbac.hasRole("admin");
```

### 4. Use Resource-Based Patterns

Organize permissions by resource for consistency:

```typescript
// Good: Resource-based
"users.view", "users.create", "users.edit";

// Avoid: Inconsistent naming
"view_users", "create_user", "edit_users";
```

### 5. Handle Permission Errors Gracefully

Provide clear feedback when access is denied:

```vue
<template>
  <div>
    <div v-if="rbac.hasPermission('users.view')">
      <UserList />
    </div>

    <v-alert v-else type="warning">
      You don't have permission to view users. Contact your administrator for
      access.
    </v-alert>
  </div>
</template>
```

### 6. Use Reactive State

Leverage reactive state for dynamic UI updates:

```typescript
// Good: Reactive
const userPermissions = rbac.userPermissions;

// Avoid: Static checks
const permissions = rbac.getUserPermissions();
```

## Troubleshooting

### Common Issues

#### 1. Permission Check Always Returns False

**Problem**: Permission checks return false even for authenticated users.

**Solution**:

- Verify user has the correct permissions in the database
- Check permission string spelling and case sensitivity
- Ensure auth store is properly initialized

```typescript
// Debug permission issues
const rbac = useRBAC();
rbac.debugUserAccess(); // Development only
rbac.testPermission("users.view"); // Development only
```

#### 2. Middleware Not Working

**Problem**: Permission middleware doesn't redirect unauthorized users.

**Solution**:

- Ensure middleware is applied in correct order: `['auth', 'permission']`
- Verify page meta is properly defined
- Check that auth middleware runs before permission middleware

```typescript
// Correct middleware order
definePageMeta({
  middleware: ["auth", "permission"], // auth first, then permission
  permission: "users.view",
});
```

#### 3. Role Hierarchy Not Working

**Problem**: Higher roles don't inherit lower role permissions.

**Solution**:

- Use `hasRoleOrHigher()` instead of `hasRole()` for hierarchy checks
- Verify role hierarchy configuration
- Check that roles are properly assigned in the database

```typescript
// Use hierarchy-aware checking
const hasAccess = rbac.hasRoleOrHigher("manager"); // Includes admin, super_admin
```

#### 4. Reactive State Not Updating

**Problem**: UI doesn't update when permissions change.

**Solution**:

- Use reactive computed properties from useRBAC
- Ensure proper reactivity with `readonly()` wrappers
- Check that auth store state is properly reactive

```typescript
// Use reactive state
const userPermissions = rbac.userPermissions; // Reactive
const isAdmin = computed(() => rbac.isAdmin()); // Reactive computed
```

### Debugging Tools

#### Development Console Logging

```typescript
// Enable debug logging in development
const rbac = useRBAC();

// Log user access information
rbac.debugUserAccess();

// Test specific permissions
rbac.testPermission("users.view");
rbac.testPermission("orders.manage");

// Get detailed access summary
const summary = rbac.getUserAccessSummary();
console.log("Access Summary:", summary);
```

#### Permission Validation

```typescript
// Validate permission setup
const rbac = useRBAC();

// Check if user has expected permissions
const expectedPermissions = ["users.view", "users.edit"];
const result = rbac.checkPermissions(expectedPermissions, "all");

if (!result.hasAccess) {
  console.error("Missing permissions:", result.missingPermissions);
}
```

### Error Messages

The system provides Arabic error messages for better user experience:

```typescript
// Arabic error messages (preserved from original system)
const errorMessages = {
  noPermission: "ليس لديك صلاحية للوصول إلى هذا المورد",
  singlePermission: 'تحتاج إلى صلاحية "{permission}" للوصول إلى هذه الصفحة',
  allPermissions: 'تحتاج إلى جميع الصلاحيات التالية: "{permissions}"',
  anyPermission: 'تحتاج إلى إحدى الصلاحيات التالية: "{permissions}"',
};
```

## Migration Guide

### From Basic Auth to RBAC

If migrating from a basic authentication system:

1. **Add Permission Fields**: Ensure user model includes `permissions` and `roles` arrays
2. **Update Database**: Add permission and role data to existing users
3. **Apply Middleware**: Add permission middleware to protected routes
4. **Update Components**: Use RBAC composable for conditional rendering

### From Role-Only to Permission-Based

If migrating from role-only system:

1. **Define Permissions**: Create granular permissions for each resource
2. **Map Roles to Permissions**: Assign appropriate permissions to existing roles
3. **Update Checks**: Replace role checks with permission checks where appropriate
4. **Maintain Compatibility**: Keep existing role checks for backward compatibility

## Conclusion

The enhanced RBAC system provides comprehensive access control with:

- Flexible permission and role management
- Resource-based access control
- Advanced checking utilities
- Reactive state management
- Arabic language support
- Comprehensive debugging tools

Use this guide as a reference for implementing secure, scalable access control in your Nuxt 4 application.
